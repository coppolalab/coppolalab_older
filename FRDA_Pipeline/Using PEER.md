**Statistical Considerations**

PEER is a powerful tool for finding hidden factors in gene expression data, but it has several limitations that must be understood if it is to be used properly.

* **Linear relationships** - PEER uses linear modeling for both the covariates you supply it with, as well as the hidden factors it finds.  If you have reason to believe that some of your covariates have non-linear relationships with gene expression, these effects would need to be removed before using PEER. If one of these covariates is one you wish to preserve for later analysis, PEER may not be the best choice for finding hidden factors.
* 
