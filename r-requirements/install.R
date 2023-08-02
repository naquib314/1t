#!/usr/bin/env Rscript
cat("Installing R dependencies...\n")

cran_packages <- c("magrittr")
all_packages <- c(cran_packages)

install.packages(all_packages)

packages_installed <- all_packages %in% installed.packages()
stopifnot(all(packages_installed))
cat("Confirmed that all packages were successfully installed\n")
