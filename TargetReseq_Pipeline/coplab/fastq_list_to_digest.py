from argparse import ArgumentParser
from collections import defaultdict
import os
import re

VALID_FORMAT = re.compile('([0-9]+)_([12]).fastq[.gz]?')
SECONDARY_FORMAT = re.compile('(MAPT.*)_R([12])_.*.fastq.gz')

def get_args():
    parser = ArgumentParser('FastQ list to a fastq digest')
    parser.add_argument('fastq_list_file', help='A file listing all fastq files')
    parser.add_argument('out', help='The output digest file')
    parser.add_argument('excluded_out', help='Write fasta files that didn\'t fit the format to this file')
    return parser.parse_args()


def get_digest_entries(args):
    fastq_files = (line.strip() for line in open(args.fastq_list_file))
    sample_fastqs = defaultdict(dict)
    dropped = list()
    for file_ in fastq_files:
        bname = os.path.basename(file_)
        parsed = VALID_FORMAT.findall(bname) or SECONDARY_FORMAT.findall(bname)
        if parsed:
            sample, read_no = parsed[0]
            sample_fastqs[sample][int(read_no)] = file_
        else:
            dropped.append(file_)
    with open(args.excluded_out, 'w') as out:
        for file_ in dropped:
            out.write('{}\n'.format(file_))
    for sample, pfiles in sample_fastqs.iteritems():
        yield '{}\t{}\t{}'.format(sample, pfiles[1], pfiles[2])

if __name__ == '__main__':
    args = get_args()
    with open(args.out, 'w') as out:
        for entry in get_digest_entries(args):
            out.write('{}\n'.format(entry))
