"""\
Various VCF and association utilities
"""
from csv import DictReader
from collections import namedtuple
import re

import pandas as pd
import numpy as np
import vcf

GENO_TO_DOSAGE = {'0/0': 0, '0|0': 0, '0/1': 1, '0|1': 1, '1/0': 1, '1|0': 1, '1/1': 2, '1|1': 2, None: np.nan}
Matrices = namedtuple('PredictorMatrices', ('cov_only', 'geno_only', 'cov_and_geno'))


def get_id(record):
    return record.ID or '{}_{}_{}/{}'.format(record.CHROM, record.POS, record.REF, 
                                             ','.join(map(str,record.ALT)))


def get_vcf_samples(vcf_file):
    return vcf.Reader(filename=vcf_file).samples


def stream_geno(vcf_file, interval, min_freq, nanmean=True):
    """\
    Parse the VCF file into a sample x genotype array for each site, and
    yield each one in turn if the frequency is larger than min_freq
    params: see parse_geno
    """
    reader = vcf.Reader(filename=vcf_file)
    if interval:
        chr, start, stop =  re.split('[:|-]', interval)
        variants = reader.fetch(chr, int(start), int(stop))
    else:
        variants = reader
    for variant in variants:
        id = get_id(variant)
        geno_row = np.array([GENO_TO_DOSAGE[sample.data.GT] for sample in variant.samples], dtype=float)
        if np.nanmean(geno_row) > min_freq:
            if nanmean:
                nans = np.where(np.isnan(geno_row))[0]
                geno_row[nans] = np.nanmean(geno_row)
            yield id, geno_row


def parse_geno(vcf_file, interval, min_freq):
    """\
    Parse the VCF file into a sample x genotype matrix for the variants
    present in a given interval. Then prune the resulting matrix according
    to the pruning kwargs.
    :param vcf_file: the path to the vcf file. The VCF is assumed to be bi-allelic.
    :param interval: a chr:start-end interval
    :param min_freq: the minimum variant frequency to consider
    
    :return: a pandas sample x genotype dataframe
    """
    ids, variants = zip(*list(stream_geno(vcf_file, interval, min_freq)))
    return get_vcf_samples(vcf_file), np.array(variants), ids


def parse_covar_matrix(cov_file, cov_fields, id_field, sample_ids=None, phe_field=None, ignore_phe=None):
    #TODO: this whole thing is brutally ugly and could use a rewrite. Probably there's something in sklearn
    #      that can do it quick-and-easy ?
    reader = DictReader(open(cov_file), delimiter='\t')
    ids, pheno, covar = list(), list(), list()
    for entry in reader:
        if phe_field:
            if ignore_phe and entry[phe_field] in ignore_phe:
                continue
            pheno.append(entry[phe_field]) 
        ids.append(entry[id_field])
        covar.append([entry[cf] for cf in cov_fields])
    # make numeric if possible
    non_numeric = list()
    for i, f in enumerate(cov_fields):
        try:
            flst = [float(lst[i]) for lst in covar]
            for j in xrange(len(covar)):
                covar[j][i] = flst[j]
        except ValueError, e:
            print('Covariate {} not numeric. Will binarize.'.format(f))
            non_numeric.append(i)
            continue
    if pheno:
        try:
            pheno = [float(p) for p in pheno]
        except ValueError:
            pass
    # if there are non-numeric covariates, binarize them
    if non_numeric:
        covar_numeric = [[covar[j][i] for i in xrange(len(cov_fields)) if i not in non_numeric]
                                     for j in xrange(len(covar))]
        covar_non_numeric = [[covar[j][i] for i in non_numeric]
                                          for j in xrange(len(covar))]
        non_numeric_df = pd.DataFrame(data=covar_non_numeric, columns=[cov_fields[i] for i in non_numeric])
        binarized_mat = None
        binarized_names = []
        for nncov in non_numeric_df.columns.values:
            binarized = pd.get_dummies(non_numeric_df[nncov])
            if binarized_mat is None:
                binarized_mat = binarized.values[:, :-1]
            else:
                binarized_mat = np.hstack((binarized_mat, binarized.values[:, :-1]))
            binarized_names.extend(['{}_{}'.format(nncov, v) for v in binarized.columns.values[:-1]])
        covar = covar_numeric
        for j in xrange(len(covar)):
            for i in xrange(binarized_mat.shape[1]):
                covar[j].append(binarized_mat[j, i])
        covar_names = [cov_fields[i] for i in xrange(len(cov_fields)) if i not in non_numeric]
        covar_names.extend(binarized_names)
    else:
        covar_names = cov_fields

    # reorder if sample_ids passed in
    if sample_ids:
        if len(set(sample_ids) - set(ids)) > 0:
            raise ValueError('Not found: {}'.format(set(sample_ids) - set(ids)))
        ordering = [ids.index(s) for s in sample_ids if s in ids]
        if pheno:
            pheno = [pheno[i] for i in ordering]
        covar = [covar[i] for i in ordering]
        ids = [ids[i] for i in ordering]
    return pd.DataFrame(data=np.array(covar), index=ids, columns=covar_names), ids, np.array(pheno)


def create_vcf_io(in_vcf, out_vcf):
    reader = vcf.Reader(filename=in_vcf)
    writer = vcf.Writer(open(out_vcf, 'wb'), reader)
    return reader, writer


def merge_data(genotype_matrix, geno_ids, variant_ids, pheno, covar, cov_names, phe_ids):
    """\
    Given a genotype matrix, covariate matrix, phenotype array, and phenotype ids,
    reorder the covariate and phenotype arrays to match the genotype matrix,
    and concatenate the covariate matrix to the genotype matrix
    """
    # first, for care, make a sample to phenotype map
    sam_pheno_validate = dict(zip(phe_ids, pheno))
    # reorder phenotype/covar to match the genotype data
    good_genos = [s for s in geno_ids if s in phe_ids]
    genotype_matrix = genotype_matrix[np.array([i for i, s in enumerate(geno_ids) if s in phe_ids]), :]
    phenotype_reordering = np.array([phe_ids.index(s) for s in good_genos])
    pheno = pd.DataFrame(pheno[phenotype_reordering], good_genos) 
    covar = covar[phenotype_reordering, :]
    combined = pd.DataFrame(np.hstack((genotype_matrix, covar)), good_genos, list(variant_ids) + cov_names)
    cov_only = pd.DataFrame(covar, good_genos, cov_names)
    geno_only = pd.DataFrame(genotype_matrix, good_genos, list(variant_ids))
    for sam, phe in zip(good_genos, pheno.values):
        assert sam_pheno_validate[sam] == phe, (sam, phe, sam_pheno_validate[sam])
    return geno_ids, pheno, Matrices(cov_only, geno_only, combined)
