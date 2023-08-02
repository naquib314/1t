#!/usr/bin/env Rscript
cat("Installing R dependencies...\n")

bioconductor_packages <- c(
    "BiocManager", "impute")

# cran_packages <- c(
#     "impute", "preprocessCore", "GO.db", "AnnotationDbi", "WGCNA")

all_packages <- c(bioconductor_packages)

# install.packages(cran_packages, repos = "http://cran.us.r-project.org")
# if (!require("BiocManager", quietly = TRUE))
#     install.packages("BiocManager")
# BiocManager::install(version = "3.17")

install.packages(
    bioconductor_packages, repos = "http://bioconductor.org/packages/3.17/bioc")

packages_installed <- all_packages %in% installed.packages()
print(packages_installed)

stopifnot(all(packages_installed))
cat("Confirmed that all packages were successfully installed\n")
