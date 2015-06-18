"""
Utilities for creating job dispatch command lines on the Univa grid.
Todo:
Actually do dispatching using the UNIVA API. See https://github.com/BeocatKSU/pyjsv
"""
import os

DEFAULT_MEMORY_REQUIREMENT='4G'
SCRIPT_WRAPPER = ("#!/bin/bash\n"
"#$ -N {}\n"
"#$ -l h_data={}\n"
"#$ -l h_vmem={}\n"
"#$ -l mem_free={}\n"
"#$ -l h_rt={}:00:00\n"
"#$ -o {}\n"
"#$ -e {}\n"
"#$ -q coppola.q\n"
"#$ -S /bin/bash\n")
SCRIPT_WRAPPER_EXCL =  ("#!/bin/bash\n"
"#$ -N {}\n"
"#$ -l h_data={}\n"
"#$ -l h_rt={}:00:00\n"
"#$ -o {}\n"
"#$ -e {}\n"
"#$ -l exclusive\n"
"#$ -q coppola.q\n"
"#$ -S /bin/bash\n")
SCRIPT_OPT_FMT = "#$ {} {}\n"
OLD_SCRIPT_PREFIX = ("export MALLOC_CHECK_=1\n"
"java -version\n"
"cat /proc/meminfo\n"
"ulimit -a\n"
"cat /proc/cpuinfo\n")
SCRIPT_PREFIX = ""

def cmd_script(cmd_to_run, jobid, dir, options, done_file, include_dependencies=False, excl=False):
    script = '{}/.{}.bash'.format(dir, jobid)
    run_script = '{}/.{}_run.bash'.format(dir, jobid)
    with open(script, 'w') as out:
        if excl:
            out.write(SCRIPT_WRAPPER_EXCL.format(options['-N'], options['memlimit'],
                      options['-t'], dir, dir))
        else:
            out.write(SCRIPT_WRAPPER.format(options['-N'], 
                      options['memlimit'],
                      options['memlimit'], options['memory'], options['-t'], dir, dir))
        if options['-hold_jid'] and include_dependencies:
           out.write(SCRIPT_OPT_FMT.format('-hold_jid', options['-hold_jid']))
        for opt in ['-cwd', '-V']:
            if options[opt]:
                out.write(SCRIPT_OPT_FMT.format(opt, ''))
        out.write(SCRIPT_PREFIX)
        out.write('>&2 echo "{}"\n'.format(cmd_to_run))
        out.write('{}\n'.format(cmd_to_run))
        out.write('touch {}\n'.format(done_file))
    return script 


def get_statusfile(output_file): 
    fdir, fbase = os.path.dirname(output_file), os.path.basename(output_file)
    fdir = fdir or '.'
    success, fail, done = '{}/.{}.ok'.format(fdir, fbase), '{}/.{}.fail'.format(fdir, fbase), '{}/.{}.done'.format(fdir, fbase)
    return success, fail, done

# todo - how do i request minimum free memory?
def make_qsub(command, job_output_files, job_id, dependencies, project_name, script_dir, memory=None, 
              add_ok=True, memory_limit=None, time_limit=24):
    if memory is None:
        # use the default or inspect from the command
        if '-Xmx' in command:
            xmx = filter(lambda u: u[:4] == '-Xmx', command.split())[0]
            memory = xmx.lstrip('-Xmx').upper()
        else:
            memory = DEFAULT_MEMORY_REQUIREMENT
    memory_limit = memory_limit or str(4 + int(memory.strip('G'))) + 'G'
    ok_cmd = ''
    if add_ok:
        first_output = job_output_files[0]
        success, fail, done = get_statusfile(first_output)
        ok_cmd = ' && touch {} || touch {}'.format(success, fail) 
    opts = {'-hold_jid': ','.join(dependencies), '-N': job_id, '-P': project_name,
            '-V': True, '-cwd': True, '-t': time_limit,  
            'memlimit': memory_limit, 'memory': memory}
    cmd_line = 'qsub {}'.format(cmd_script("{}{}".format(command, ok_cmd), job_id, script_dir, opts, done))
    return cmd_line
