FROM ubuntu:jammy

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update -y && apt-get install -y r-base
RUN apt-get update -y && apt-get install -y build-essential
COPY r-requirements /r-requirements
RUN cd /r-requirements && Rscript install.R

RUN python3 "Hello World"
