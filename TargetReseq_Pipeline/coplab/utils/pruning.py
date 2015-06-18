"""\
Utilities for variant encoding and pruning
"""
import numpy as np
from statsmodels.stats.outliers_influence import variance_inflation_factor as sm_vif

def prune_greedy(var_stream, max_vif, n_var, n_samples, covariates=None):
    """\
    Greedily take every variant whose variance inflation factor is below 
    `max_vif`. The VIF is calculated by the previous `n_var` variants 
    (so forward correlations are ignored) plus any covariates
    :param var_stream: an iterator that produces (id, genotype_data) tuples 
    :param max_vif: the maximum variance inflation factor
    :param n_var: the number of variants to maintain in the window
    :param covariates: a n_covar x n_sample np matrix (or none) of covariates to use,
      e.g. if you want to remove variants highly correlated with PCs
    :returns: the ids of the variants to keep
    """
    kept_ids = list()
    covariates = covariates if covariates is not None else np.ones((n_samples, 1), dtype=float)
    var_mat = covariates 
    cov_size = covariates.shape[1]
    n, p, k = 0, 0, 0
    for id, row in var_stream:
        var_mat = np.hstack((var_mat, row.reshape((n_samples, 1))))
        vif = sm_vif(var_mat, var_mat.shape[1]-1)
        if vif > max_vif:
            var_mat = var_mat[:, :-1]
            p += 1
        else:
            kept_ids.append(id)
            k += 1
        if var_mat.shape[1] > n_var + cov_size:
            var_mat = np.hstack((covariates, var_mat[:, (1 + cov_size):]))
        n += 1
        if n % 250 == 0:
            print('processed: {}, pruned: {}, kept: {}'.format(n, p, k))
    return kept_ids 
