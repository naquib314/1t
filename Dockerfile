FROM ubuntu:jammy

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -y && apt-get install -y r-base r-base-dev libcurl4-openssl-dev libssl-dev libxml2-dev
RUN apt-get update -y && apt-get install -y build-essential
COPY r-requirements /r-requirements
RUN cd /r-requirements && Rscript install.R
