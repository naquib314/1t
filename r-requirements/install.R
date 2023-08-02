#!/usr/bin/env Rscript
cat("Installing R dependencies...\n")

cran_packages <- c("magrittr")
bioconductor_packages <- c("impute")
all_packages <- c(cran_packages, bioconductor_packages)

packages_installed <- all_packages %in% installed_packages()

if(!all(packages_installed)) {
    install.packages(cran_packages, repos = "http://cran.us.r-project.org")

    if (!requireNamespace("BiocManager", quietly = TRUE))
       install.packages("BiocManager", 
       repos = "http://bioconductor.org/packages/3.9/bioc")


    for (package in bioconductor_packages) {
        BiocManager::install(package)
    }
}

packages_installed <- all_packages %in% installed_packages()
stopifnot(all(packages_installed))
cat("Confirmed that all packages were successfully installed\n")
