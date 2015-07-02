#===============================================================================
#
#          FILE:  align_and_call_targeted.py
#
#         USAGE: #put align_and_call_targeted.py and /coplab in the same fold and run python  
#                 python AlignCallTarget.py --pname Proj --memlimit 4 sample_digest_file outfolder tmp_outvcf human_g1k_v37.no_unlocalized_contigs.fasta dbsnp_138.b37.vcf 2014.Takeda.new.intervals
#
#   DESCRIPTION: 
#
#       OPTIONS:  ---
#  REQUIREMENTS:  ---
#          BUGS:  ---
#         NOTES:  ---
#        AUTHOR:  ——-
#       COMPANY: ICNN, UCLA
#       CREATED:  ——-
#      REVISION: 06/10/2015

#   reference file versions:
#   reference genome: human_g1k_v37.no_unlocalized_contigs.fasta(ftp://ftp.1000genomes.ebi.ac.uk/vol1/ftp/technical/reference/,1000genome project, v37, 5/17/10)
#   dbsnp database: dbsnp_138.b37.vcf(build 138, 04/25/13)
#   target region files: 2014.Takeda.new.intervals
#   if exome sequencing, using target region files: SeqCap_EZ_Exome_v3_primary.bed.intervals(SeqCap EZ Human Exome Library v3.0 download from http://www.nimblegen.com/products/seqcap/ez/v3/index.html)

#   software versions:(default pipeline setting on Orion UCLA /share/apps/)
#   Python 2.7.8
#   bwa-0.7.12
#   picard-tools-1.128
#   samtools-1.1

#   software versions:(running exome sequencing 2015-9075)
#   bwa-0.7.12
#   picard-tools-1.130
#   samtools-1.1
#   GenomeAnalysisTK-3.3-0
#===============================================================================


"""
Align fastqs for targeted sequencing, dedup them, indel realign, and then call the cohort
The input fastq list should be in the format
sample   fastq1    fastq2
and this script assumes paired-end sequencing. 
"""

from argparse import ArgumentParser
from itertools import islice
import os


from coplab.utils import command_line_utils, gridutils, dispatcher


def parse_args():
    parser = ArgumentParser('Align and call targeted sequencing run')
    parser.add_argument('fastq_digest', help='File specifying the samples and fastq files. See comment at top of script.')
    parser.add_argument('intermediate_dir', help='Directory in which to place intermediate files')
    parser.add_argument('output_vcf', help='Location of the output vcf file')
    parser.add_argument('reference', help='The reference file (must have .fasta.btw files next to it)')
    parser.add_argument('dbsnp', help='The dbsnp vcf')
    parser.add_argument('intervals', help='The target interval list')
    parser.add_argument('--pname', help='The name of the project (for use in naming files/jobs)', default='cltgt')
    parser.add_argument('--memlimit', help='The memory limit (in g)', default=4, type=int)
    parser.add_argument('--script_dir', help='Place to write the qsub scripts', default=os.getcwd() + '/.qsub_scripts')
    parser.add_argument('--scatter', help='Number of ways to scatter', default=25, type=int)
    return parser.parse_args()


def call_sample_gvcf(sample_id, fq1, fq2, manager, args):
    """\
    Set up the pipeline to generate the call-ready sample bam
    """
    gatk_args = {'reference': args.reference, 'intervals': args.intervals} 
    java_args = { '-Xmx{}g'.format(args.memlimit): True, '-Xms{}g'.format(max(1, args.memlimit-2)): True, '-Djava.io.tmpdir=/coppolalabshares/marisaprj01/tmp_dir': True}
    for arg in java_args:
        gatk_args[arg] = True
    sample_dir = args.intermediate_dir + '/{}'.format(sample_id)
    if not os.path.exists(sample_dir):
        os.mkdir(sample_dir)
    def _mkfile(name):
        return sample_dir + '/{}'.format(name)
    # make the read group info
    rgstr = '"@RG\\tID:{}_rg\\tPL:ILLUMINA\\tPU:Unknown\\tLB:Unknown\\tSM:{}"'.format(sample_id, sample_id)
    sai1 = _mkfile('{}_1.sai'.format(sample_id))
    sai2 = _mkfile('{}_2.sai'.format(sample_id))
    raw_bam = _mkfile('{}.aln.bam'.format(sample_id))
    sorted_bam = _mkfile('{}.sorted.bam'.format(sample_id))
    dedup_bam = _mkfile('{}.aln.dedup.bam'.format(sample_id))
    realn_int = _mkfile('{}.realn.intervals.list'.format(sample_id))
    realn_bam = _mkfile('{}.aln.dedup.realn.bam'.format(sample_id))
    call_gvcf = _mkfile('{}.haplotypecaller.vcf'.format(sample_id))
    manager.bwa_aln_fasta(fq1, sai1, args.reference)
    manager.bwa_aln_fasta(fq2, sai2, args.reference)
    manager.bwa_aln_pair(sai1, sai2, fq1, fq2, args.reference, raw_bam, **{'-r': rgstr})
    manager.sort_bam(raw_bam, sorted_bam, **java_args)
    manager.mark_duplicates(sorted_bam, dedup_bam, **java_args)
    manager.create_indel_intervals([args.dbsnp], input=dedup_bam, output=realn_int, **gatk_args)
    manager.realign_intervals([args.dbsnp], input=dedup_bam, target_intervals=realn_int, output=realn_bam, 
                              **{k: v for k, v in gatk_args.iteritems() if k != 'intervals'})
    manager.haplotype_caller(dbsnp=args.dbsnp, input=dedup_bam, output=call_gvcf, 
                             scatter=args.scatter, **gatk_args)
    return call_gvcf


def script(args):
    #manager = command_line_utils.CmdManager(job_pfx=args.pname)
    manager = dispatcher.Dispatcher(args.pname, args.script_dir, job_pfx=args.pname, user='edasilvaramos')
    variant_calls = dict()
    for sample, fastq1, fastq2 in (line.strip().split() for line in open(args.fastq_digest)):
        variant_calls[sample] = call_sample_gvcf(sample, fastq1, fastq2, manager, args)
    # combine the gvcfs
    gvcf_iter = variant_calls.itervalues()
    batch, batch_no, prev_merge = list(islice(gvcf_iter, 100)), 1, None
    while batch:
        merge_out = args.intermediate_dir + '/.gvcf_merge_{}.vcf'.format(batch_no)
        if prev_merge:
            batch.append(prev_merge)
        manager.combine_gvcfs(variants=batch, output=merge_out, reference=args.reference,
                             **{'-Xmx6g': True, '-Xms4g': True})
        batch, batch_no, prev_merge = list(islice(gvcf_iter, 100)), 1 + batch_no, merge_out
    manager.genotype_gvcfs(variants=prev_merge, reference=args.reference, output=args.output_vcf,
                           **{'-Xmx8g': True, '-Xms4g': True}) 
    manager.dispatch_jobs()


if __name__ == '__main__':
    args = parse_args()
    if not os.path.exists(args.script_dir):
        os.mkdir(args.script_dir)
    script(args) 
