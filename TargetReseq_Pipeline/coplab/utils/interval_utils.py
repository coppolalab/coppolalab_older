"""
Utilities for dealing with interval lists
"""
import re

INTERVAL_PARSE_REGEX = '(\S+)[:|\t]([0-9]+)[-|\t]([0-9]+)'


def parse_interval(ival):
    """\
    Parse an interval using the global regex. Note that the format iex
    expected to be one of:
    chr:start-stop
    chr[tab]start[tab]stop[tab]
    """
    chr, start, end = re.findall(INTERVAL_PARSE_REGEX, ival)[0]
    return chr, int(start), int(end)


def make_interval(chr, start, stop, format_='{}:{}-{}'):
    """Format chr/start/stop into an interval string with the given format"""
    return format_.format(chr, start, stop)


def greedy_group_intervals(intervals, target_size):
    """\
    Given a list of intervals, group them together into groups of intervals
    whose total length is approximately target_size. Do this greedily, grouping
    successive intervals until `target_size` is exceeded, then moving on
    to the next group.
    :param intervals: list of intervals, format: (str, int, int)
    :param target_size: the target size for the groups
    """
    groups, group, size = [], [], 0
    for interval in intervals:
        group.append(interval)
        size += interval[2] - interval[1]
        if size >= target_size:
            groups.append(group)
            group, size = [], 0
    if group:
        groups.append(group)
    return groups
