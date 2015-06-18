"""
A dispatcher
"""
import os
import subprocess
import re
import time

from coplab.utils.command_line_utils import CmdManager
from coplab.utils import gridutils

QSUB_EXPR = re.compile('Your job ([0-9]+) \("(.*)"\) has been submitted')

class Dispatcher(CmdManager):
    def __init__(self, project_name, script_dir, max_jobs=20, max_retry=3, job_pfx="Dispatcher", 
                 user=os.getlogin(), wait_time=300, force_rerun=False, default_memory=None):
        super(Dispatcher, self).__init__(job_pfx)
        self.max_jobs = max_jobs
        self.max_retry = max_retry
        self.user = user
        self.wait_time = wait_time
        self.force_rerun = force_rerun
        self.project_name = project_name
        self.script_dir = script_dir
        self.default_memory = default_memory
        self.jid_map = dict()
        self.running_jobs = dict()
        self.successfully_completed = set()
        self._ramp = 100

    def dispatch_jobs(self):
        while any((not self.completed(k) for k in self.commands.iterkeys())):
            self.handle_completed_jobs()
            # spawn new jobs
            to_spawn = [k for k in self.commands if k not in self.jid_map.values() and
                        self.dependencies_met(k) and not self.completed(k)]
            nqueued = len(self.queued_jobs())-2
	    if(nqueued < 0):
		nqueued=0
            print('{} jobs active, {} jobs waiting, {} max'.format(nqueued, len(to_spawn), self.max_jobs - nqueued))
            n_to_spawn = min(self._ramp, self.max_jobs-nqueued, len(to_spawn))
            print('Launching {} jobs'.format(n_to_spawn))
            for command in to_spawn[:n_to_spawn]:
                self.launch(command)
            self.handle_completed_jobs()
            time.sleep(self.wait_time)
    
    def launch(self, cid, n_reps=0):
        cmdline, dependencies, outputs = self.commands[cid]
        # make the script
        qsub_cmd = gridutils.make_qsub(cmdline, outputs, cid, dependencies, self.project_name,
                                       self.script_dir, memory_limit=self.default_memory)
        print(qsub_cmd)
        submit = subprocess.Popen(qsub_cmd.split(), stdout = subprocess.PIPE)
        #submit.wait()  this can hang and is unnecessary
        result = submit.communicate()[0]
        job_id, cmd_id = QSUB_EXPR.findall(result)[0]
        assert cmd_id == cid, 'cid={}, cmd_id={}'.format(cid, cmd_id)
        self.jid_map[job_id] = cid 
        self.running_jobs[job_id] = (cid, n_reps)
        print('Queued {}({})'.format(cid, job_id))

    def dependencies_met(self, cmd_id):
        cmdline, dependencies, outputs = self.commands[cmd_id]
        return len(dependencies) == 0 or all((self.completed(d) for d in dependencies))

    def completed(self, cmd_id):
        cmdline, dependencies, outputs = self.commands[cmd_id]
        okfile, failfile, donefile = gridutils.get_statusfile(outputs[0])
        return (os.path.exists(okfile) and not self.force_rerun) or cmd_id in self.successfully_completed

    def handle_completed_jobs(self):
        finished_jobs = set(self.running_jobs.keys()) - set(self.queued_jobs())
        print('Processing {} finished jobs...'.format(len(finished_jobs)))
        for job in finished_jobs:
            cmd_id, num_rerun = self.running_jobs[job]
            cmdline, dependencies, outputs = self.commands[cmd_id]
            okfile, failfile, donefile = gridutils.get_statusfile(outputs[0])
            if os.path.exists(okfile):
                print('Command {}({}) successfully completed'.format(cmd_id, job))
                del self.running_jobs[job]
                self.successfully_completed.add(cmd_id)
            elif os.path.exists(failfile):
                print('Fatal error running {}({}). Retrying.'.format(cmd_id, job))
                if num_rerun >= self.max_retry:
                    raise ValueError('Command {} exceeded the maximum number of retries'.format(cmd_id))
                del self.running_jobs[job]
                self.launch(cmd_id, 1 + num_rerun)
            else:
                if not os.path.exists(donefile):    
                    print('Node failure running {}({}). This is a known issue. Assuming everything is OK...'.format(cmd_id, job))
                    if num_rerun >= self.max_retry:
                        raise ValueError('Command {} exceeded the maximum number of retries'.format(cmd_id))
                    #self.launch(cmd_id, 1 + num_rerun)
                    #TODO FIXME TODO FIXME
                    del self.running_jobs[job]
                    self.successfully_completed.add(cmd_id)
                else:
                   print('OK file does not exist for {}({}). This file will not be checkpointed.'.format(cmd_id, job))
                   del self.running_jobs[job]
                   self.successfully_completed.add(cmd_id)

    def queued_jobs(self):
        cmd = subprocess.Popen(["qstat", "-u", self.user], stdout = subprocess.PIPE)
        #cmd.wait()
        jobs = cmd.communicate()[0].strip()
        return [j.split()[0] for j in jobs.split('\n')] if jobs != '' else []
