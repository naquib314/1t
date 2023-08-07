#!/bin/bash

set -ex

DOCKERFILE_DIR="$1"

cd $DOCKERFILE_DIR && ls -l

# CONSEQ_VERSION=2.0.2
# if [ ! -e conseq-${CONSEQ_VERSION}.tar.gz ] ; then
#   sudo curl -L https://github.com/broadinstitute/conseq/releases/download/v${CONSEQ_VERSION}/conseq-${CONSEQ_VERSION}.tar.gz -o $(DOCKERFILE_DIR)/conseq-${CONSEQ_VERSION}.tar.gz
# fi

# ls -l $(DOCKERFILE_DIR)

# echo ls -l $(DOCKERFILE_DIR)
