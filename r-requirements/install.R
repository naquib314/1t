#!/usr/bin/env Rscript

cat("Installing R dependencies...\n")

cran_packages <- c(
    "BiocManager", "magrittr", "tibble", "plyr", "feather", "dplyr", 
    "RSQLite", "DBI", "ashr", "corpcor", "tidyverse")

bioconductor_packages <- c(
    "impute", "rhdf5", "GO.db", "preprocessCore", "WGCNA")

all_packages <- c(cran_packages, bioconductor_packages)

for (package in cran_packages) {
    install.packages(package)
}

for (package in bioconductor.packages) {
        BiocManager::install(package)
    }

packages_installed <- all_packages %in% installed.packages()
print(packages_installed)
stopifnot(all(packages_installed))
cat("Confirmed that all packages were successfully installed\n")
