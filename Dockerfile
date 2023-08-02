FROM ubuntu:jammy

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -y && apt-get install -y gnupg software-properties-common
RUN apt-get update -y && apt-get install -y r-base
RUN apt-get update -y && apt-get install -y build-essential libxml2-dev zlib1g-dev autoconf autogen make rubygems ruby-full libtool bison flex git libcurl4-openssl-dev libssl-dev

COPY r-requirements /r-requirements
RUN cd /r-requirements && Rscript install.R
