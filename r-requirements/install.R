#!/usr/bin/env Rscript
cat("Installing R dependencies...\n")

cran.packages <- c("magrittr", "tibble", "plyr", "feather", "dplyr", "RSQLite", "DBI", "WGCNA", "ashr", "corpcor", "tidyverse")
bioconductor.packages <- c("impute", "rhdf5", "GO.db", "preprocessCore", "WGCNA")
all.packages <- c(cran.packages, bioconductor.packages)

packages.installed <- all.packages %in% installed.packages()

if(!all(packages.installed) ) {
    install.packages(cran.packages, repos="https://cran.revolutionanalytics.com/")

    if (!requireNamespace("BiocManager", quietly = TRUE))
       install.packages("BiocManager", repos="https://cran.revolutionanalytics.com/")


    for (package in bioconductor.packages) {
        BiocManager::install(package)
    }
}

packages.installed <- all.packages %in% installed.packages()
stopifnot(all(packages.installed))
cat("Confirmed that all packages were successfully installed\n")
