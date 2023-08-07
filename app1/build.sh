#!/bin/bash

DOCKERFILE_DIR="$1"
echo ls -l $(DOCKERFILE_DIR)

# CONSEQ_VERSION=2.0.2
# if [ ! -e conseq-${CONSEQ_VERSION}.tar.gz ] ; then
#   curl -L https://github.com/broadinstitute/conseq/releases/download/v${CONSEQ_VERSION}/conseq-${CONSEQ_VERSION}.tar.gz -o $(DOCKERFILE_DIR)/conseq-${CONSEQ_VERSION}.tar.gz
# fi

# echo ls -l $(DOCKERFILE_DIR)
