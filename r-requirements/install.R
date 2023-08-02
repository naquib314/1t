#!/usr/bin/env Rscript
cat("Installing R dependencies...\n")

cran_packages <- c(
    "magrittr", "tibble", "plyr", "feather", "dplyr",
    "RSQLite", "DBI", "WGCNA", "ashr", "corpcor", "tidyverse")
all_packages <- c(cran_packages)

install.packages(all_packages)

packages_installed <- all_packages %in% installed.packages()
print(packages.installed)

stopifnot(all(packages_installed))
cat("Confirmed that all packages were successfully installed\n")
