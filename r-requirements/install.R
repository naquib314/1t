#!/usr/bin/env Rscript
cat("Installing R dependencies...\n")

cran_packages <- c(
    "magrittr", "tibble", "plyr", "feather", "dplyr",
    "RSQLite", "DBI", "WGCNA", "ashr", "corpcor", "tidyverse")

bioconductor_packages <- c(
    "BiocManager", "impute", "rhdf5", "GO.db", "preprocessCore", "WGCNA")

all_packages <- c(cran_packages)

install.packages(cran_packages, repos = "http://cran.us.r-project.org")
# source("https://bioconductor.org/biocLite.R")
# biocLite(bioconductor_packages)

packages_installed <- all_packages %in% installed.packages()
print(packages_installed)

stopifnot(all(packages_installed))
cat("Confirmed that all packages were successfully installed\n")
