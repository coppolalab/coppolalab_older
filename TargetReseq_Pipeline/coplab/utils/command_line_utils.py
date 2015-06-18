"""
A library of command line definitions for sequencing. Note that the default locations where
this library looks to find Picard jarfiles and the GATK jar is in *my* directories. These
defaults can be overwritten by setting the environment variables 'PICARD_HOME' and 'GATK_JAR'
Note that the GATK jar necessary here is the 'package' build target
A function that builds a command line must return
 1) the command line as a string
 2) a list of output files
(2) enables the construction of job dependencies
"""
from collections import namedtuple, OrderedDict
import os
from os.path import normpath
import re
import types

from coplab.utils import interval_utils as iutil

PICARD_HOME=os.getenv('PICARD_HOME', '/u/home/c/chartl/builds/picard/dist/')
GATK_JAR=os.getenv('GATK_JAR', '/u/home/c/chartl/repo/ext/gatk/gatk-protected/target/GenomeAnalysisTK.jar')
GATK_STANDARD_ARGS = {'input': '-I', 'reference': '-R', 'output': '-o', 'log': '-log',
                      'nct': '-nct', 'nt': '-nt', 'intervals': '-L', 'dbsnp': '-D',
                      'variants': '-V',
                      'excludeIntervals': '-XL', 'intervalSetRule': '-isr',
                      'intervalPadding': '-ip', 'loggingLevel': '-l'}  # not everything
JAVA_OPTS = {'-Xmx', '-Xms', '-Xprof', '-Xrs', '-Xss'}
JAVA_PROP_REGEX = '-D\S+=\S+'

def make_opts(cmd_options, java_opt=False):
    """\
    Converts a dictionary of options/flags into a string that should appear on the command
    line. {'-X': 'hello'} => '-X hello'; {'-Y': True} => '-Y'.
    Believe it or not, this is the workhorse method here.
    :param java_opt: if true, no space will be placed between the option 
                      (i.e. {'-Xmx': '4g'} => '-Xmx4g')
    """
    sep = '' if java_opt else ' '
    def _fmt(opt, val):
       if val is True:
           return opt
       if isinstance(val, list):
           return ' '.join(['{}{}{}'.format(opt, sep, v) for v in val])
       elif val:
           return '{}{}{}'.format(opt, sep, val)
       return ''
    return ' '.join([_fmt(k, v) for k, v in cmd_options.iteritems()])


def is_java_option(opt):
    """Guess if the option (like -Djava.io.tmpdir=/home/tmp) is a java option"""
    return any((opt[:len(s)] == s for s in JAVA_OPTS)) or re.match(JAVA_PROP_REGEX, opt)


def java_opts(java_cmd):
    """\
    Decorator that will correctly handle java options for a command line that is a java
    execution. It will pop out the -Xmx -Xms and other java options and place them in
    the correct location of the command line.
    """
    def create_command(*args, **kwargs):
        java_opts = make_opts({opt: val for opt, val in kwargs.iteritems() 
                               if is_java_option(opt)}, java_opt=True)
        cmd, outfile = java_cmd(*args, **{k: v for k, v in kwargs.iteritems() 
                                if not is_java_option(k)})
        if cmd[:4] != 'java':
            raise ValueError('Cannot wrap non-java command {} with java_opts'.format(cmd))
        cmd = 'java ' + java_opts + cmd[4:]
        return cmd, outfile
    return create_command


def gatk(walker_name):
    """Decorator so we don't have to deal with any of the 'standard' GATK arguments"""
    def make_wrapper(walker_cmd):
        """Replace the base make commandline with one that uses the standard args"""
        def create_command(*args, **kwargs):
            gatk_std = {GATK_STANDARD_ARGS[opt]: value for opt, value in kwargs.iteritems()
                        if opt in GATK_STANDARD_ARGS}
            gatk_std['-T'] = walker_name
            new_kwargs = {opt: value for opt, value in kwargs.iteritems() 
                          if opt not in GATK_STANDARD_ARGS}
            sub_cmd, output = walker_cmd(*args, **new_kwargs)
            if output and 'output' in kwargs:
                # the walker produces some additional output, so append the standard output
                if isinstance(output, list):
                    output.append(kwargs['output'])
                else:
                    output = [output, kwargs['output']]
            else:
                output = [kwargs['output']] if 'output' in kwargs else [] 
            cmd = 'java -jar {} {} {}'.format(GATK_JAR, make_opts(gatk_std), sub_cmd)
            return cmd, output
        return create_command
    return make_wrapper


def scatter_gatherable(combine_command, combine_args=None, output_arg='output', interval_arg='intervals',
                       input_arg='input', borrow_kwargs=None):
    """\
    A decorator that enables a function to be scatter-gathered by interval. Scatter-gather means
    breaking the single job into `n_jobs` sub-jobs, running those in parallel, and combining the
    results together with a final execution of `combine_command`.
    :param n_jobs: The number of jobs to run. If this exceeds the total number of intervals, then
        only (# intervals) jobs will run.
    :param combine_command: the command line to run to assemble the scatter outputs into the final
        gathered output. Will be called as
        combine_command(input_arg=scatter_outputs, output=destination_file, **combine_args)
    :param output_arg: the name of the argument that holds the output file. Note that this means
        when the funtion is being called, the output must be specified as a keyword argument.
    :param interval_arg: `output_arg` except it's the name of the argument that will hold the
        interval list.
    """
    def make_scatter_gather(underlying_fx):
        def scatter_gather(*args, **kwargs):
            n_scatter = kwargs.pop('scatter', 1)
            if n_scatter <= 1:
                # don't want to parallelize
                return underlying_fx(*args, **kwargs)
            if output_arg not in kwargs:
                raise ValueError('Argument not found: {}. Must be specified as keyword.'.format(output_arg))
            if interval_arg not in kwargs:
                raise ValueError('Argument not found: {}. Must be specified as keyword.'.format(interval_arg))
            # get the output directory from the output argument
            out_dir = os.path.dirname(kwargs[output_arg]) or os.getcwd()
            # make a hidden scatter-gather dir
            sg_dir = out_dir + '/.sg_{}/'.format(os.path.basename(kwargs[output_arg]))
            if not os.path.exists(sg_dir):
                os.mkdir(sg_dir)
            # read in the intervals and calculate the target size for each scatter-gather chunk 
            _intervals = map(iutil.parse_interval, open(kwargs[interval_arg]))
            total_size = sum((i[2]-i[1] for i in _intervals))
            target_size = total_size/n_scatter
            # make the scatter-gather subdirectories and write the interval file
            def mksgdir(job_intervals, job_number):
                jobdir = sg_dir + 'sg{}/'.format(job_number)
                if not os.path.exists(jobdir):
                    os.mkdir(jobdir)
                ifile = jobdir + os.path.basename(kwargs[interval_arg])
                with open(ifile, 'w') as out:
                    out.write("\n".join(['{}:{}-{}'.format(a, b, c) for a, b, c in job_intervals]))
                ofile = jobdir + os.path.basename(kwargs[output_arg])
                return ifile, ofile
            chunks = iutil.greedy_group_intervals(_intervals, target_size)
            sgfiles = [mksgdir(chunk, job_no) for job_no, chunk in enumerate(chunks)]
            # now with the intervals and output files for each job, we can create the specific jobs
            scatter_jobs = list()
            kwarg_clone = {k: v for k, v in kwargs.iteritems()}
            for sgjob in sgfiles:
                kwarg_clone[output_arg] = sgjob[1]
                kwarg_clone[interval_arg] = sgjob[0]
                scatter_jobs.append(underlying_fx(*args, **kwarg_clone))
            args = combine_args or {}
            args[output_arg] = kwargs[output_arg]
            args[input_arg] = [j[1] for j in sgfiles]
            for k in borrow_kwargs:
                args[k] = kwargs[k]
            gather_job = combine_command(**args)
            return scatter_jobs + [gather_job]
        return scatter_gather
    return make_scatter_gather


def index_bam(fxn):
    """Decorator that adds a samtools command to index the resulting bamfile"""
    def wrapper(*args, **kwargs):
        cmd, outputs = fxn(*args, **kwargs)
        for out in outputs:
            if out[-4:] == '.bam':
                cmd += ' && samtools index {}'.format(out)
        return cmd, outputs
    return wrapper
             

def bwa_aln_fasta(in_fastq, out_sai, reference, **opts):
    """\
    Command line for bwa aln fq ref > sai.
    Keyword arguments must be of the form {'-t': 3, '-B': True} etc.
    requires: the bwa executable to be accessible from the $PATH
              the bwa fasta index (.bwt) to be next to the reference and
                 named '{}.fasta.bwt'
    """
    return 'bwa aln {} {} {} > {}'.format(make_opts(opts), reference, in_fastq, out_sai), [out_sai]


def bwa_aln_pair(sai1, sai2, fq1, fq2, reference, bam, **opts):
    """
    Command line for paired-end aligning two bwa-transformed fastq files
    requires: bwa executable accessible from $PATH
              reference .bwt to be $reference.bwt
    """
    return 'bwa sampe {} {} {} {} {} {} > {}'.format(make_opts(opts),
             reference, sai1, sai2, fq1, fq2, bam), [bam]

@index_bam
@java_opts
def sort_bam(unsorted_bam, sorted_out, stringency='LENIENT', **opts):
    """command line to sort a bam file"""
    jarfile = PICARD_HOME + ' SortSam'
    return ('java -jar {} {} I={} O={} '
            'VALIDATION_STRINGENCY={} SO=coordinate'.format(jarfile, make_opts(opts), 
                                                            unsorted_bam, sorted_out, stringency)), [sorted_out]


@index_bam
@java_opts
def mark_duplicates(in_bam, out_bam, stringency='LENIENT', **opts):
    jarfile = PICARD_HOME + ' MarkDuplicates'
    return ('java -jar {} {} I={} O={} VALIDATION_STRINGENCY={}'
            ' M={}.dup_metrics'.format(jarfile, make_opts(opts), in_bam, out_bam, stringency, out_bam)), [out_bam]


@java_opts
@gatk('RealignerTargetCreator')
def create_indel_intervals(known_indels):
    return ' '.join(['--known {}'.format(vcf) for vcf in known_indels]), None


@index_bam
@java_opts
@gatk('IndelRealigner')
def realign_intervals(known_indels, target_intervals):
    if isinstance(known_indels, basestring):
        known_indels = [known_indels]
    return ' '.join(['-known {}'.format(vcf) for vcf in known_indels]) + \
             ' ' + '--targetIntervals {}'.format(target_intervals), None


@java_opts
@gatk('CombineVariants')
def combine_variants(genotype_merge_opts=None, filtered_records_merge_type=None, priority=None, setKey='set',
                     assume_identical_samples=False, exclude_non_variants=False):
    cmd = ''
    if genotype_merge_opts:
        cmd += ' -genotypeMergeOptions {}'.format(genotype_merge_opts)
    if filtered_records_merge_type:
        cmd += ' -filteredRecordsMergeType {}'.format(filtered_records_merge_type)
    if priority:
        cmd += ' -priority {}'.format(priority)
    if setKey != 'set':
        cmd += ' -setKey {}'.format(setKey)
    if assume_identical_samples:
        cmd += ' -assumeIdenticalSamples'
    if exclude_non_variants:
        cmd += ' -env'
    return cmd, None


@scatter_gatherable(combine_command=combine_variants, input_arg='variants', borrow_kwargs=['reference'], 
                    combine_args={'assume_identical_samples': True, '-Xmx8g': True, '-Xms2g': True})
@java_opts
@gatk('UnifiedGenotyper')
def unified_genotyper(contamination=None, contamination_file=None, alleles_vcf=None, ploidy=2,
                      maxAltAlleles=None, stand_call_conf=None, stand_emit_conf=None, 
                      include_nda=False, likelihood_model='SNP', min_base_quality=22):
    if ploidy != 2 and likelihood_model[:len('GENERAL')] != 'GENERAL':
        raise ValueError('Use likelihood_model=GENERALPLOIDYSNP for non-diploid calls')
    opts = {'-glm': likelihood_model, '-nda': include_nda, '-mbq': min_base_quality,
            '-stand_call_conf': stand_call_conf, '-stand_emit_conf': stand_emit_conf,
            '-gt_mode': 'GENOTYPE_GIVEN_ALLELES' if alleles_vcf else None,
            '-alleles': alleles_vcf, '-ploidy': ploidy, '-contaminationFile': contamination_file,
            '-contamination': contamination}
    return make_opts({k: v for k, v in opts.iteritems() if v}), []



@java_opts
@gatk('CombineGVCFs')
def combine_gvcfs(bps=False):
    if bps:
         return make_opts({'-bpResolution', True}), []
    return make_opts({}), []


@java_opts
@gatk('GenotypeGVCFs')
def genotype_gvcfs(call_conf=None, emit_conf=None, max_alts=None, nda=True):
    opts = {'-stand_call_conf': call_conf, '-stand_emit_conf': emit_conf,
            '-maxAltAlleles': max_alts, '-nda': nda}
    return make_opts({k: v for k, v in opts.iteritems() if v}), []


@scatter_gatherable(combine_command=combine_gvcfs, input_arg='variants', borrow_kwargs=['reference'],
                    combine_args={'-Xmx6g': True, '-Xms2g': True})
@java_opts
@gatk('HaplotypeCaller')
def haplotype_caller(ref_conf='GVCF', nda=True, call_conf=None, emit_conf=0, max_alts=4, contamination=0.02):
    opts = {'-ERC': ref_conf, '-nda': nda, '-stand_call_conf': call_conf, '-stand_emit_conf': emit_conf,
            '-maxAltAlleles': max_alts, '-contamination': contamination}
    opts['-variant_index_type'] = 'LINEAR'
    opts['-variant_index_parameter'] = '128000'
    return make_opts({k: v for k, v in opts.iteritems() if v is not None and v is not False}), [] 

_fx_blacklist = {'namedtuple', 'gatk', 'java_opts', 'is_java_option', 'make_opts', 'scatter_gatherable'}
_avail_func = {name: var for name, var in locals().iteritems() 
               if isinstance(var, types.FunctionType) and name not in _fx_blacklist} 

class CmdManager(object):
    def __init__(self, job_pfx='CmdManager'): 
        self.file_registry = {}
        self.commands = OrderedDict()
        self._command_no = 1
        self._cname_fmt = job_pfx + '-{}' 

# register the available command line functions with the manager
def _mkfn(fx_name, cmd_fx, cls):
    """\
    Turn the function `cmd_fx` into a CmdManager class method that deals with
    job dependencies
    """
    def temp_func(self, *args, **kwargs):
        def _unlist(lst):
            newlst = []
            for e in lst:
                if isinstance(e, list):
                    newlst = newlst + _unlist(e)
                else:
                    newlst.append(e)
            return newlst
        commands = cmd_fx(*args, **kwargs)
        if not isinstance(commands, list): # not a scatter gather
            command_list, is_sg = [commands], False
        else:
            command_list, is_sg = commands[:-1], True  # only the scatters
        for command_line, outputs in command_list:
            command_id = self._cname_fmt.format(self._command_no)
            self._command_no += 1
            dependencies = {self.file_registry[normpath(arg)] for arg in _unlist(args)
                            if isinstance(arg, basestring) and normpath(arg) in self.file_registry}
            for aval in _unlist(kwargs.values()):
                if isinstance(aval, basestring) and normpath(aval) in self.file_registry:
                    dependencies.add(self.file_registry[normpath(aval)])
            for outfile in outputs:
                self.file_registry[normpath(outfile)] = command_id
            self.commands[command_id] = (command_line, dependencies, outputs)
        if is_sg:  # special case the gather function, whose dependencies we have to infer
            command_line, outputs = commands[-1]
            command_id = self._cname_fmt.format(self._command_no)
            self._command_no += 1
            dependencies = {self.file_registry[normpath(sgout[0])] for _, sgout in command_list}
            for outfile in outputs:
                self.file_registry[normpath(outfile)] = command_id
            self.commands[command_id] = (command_line, dependencies, outputs)
        return command_list
    setattr(cls, fx_name, types.MethodType(temp_func, None, cls))

for name, fx in _avail_func.iteritems():
    _mkfn(name, fx, CmdManager)
