FROM node:16.13.2-buster

MAINTAINER vence2013

COPY sources.list /etc/apt/sources.list

RUN apt-get update && \
    apt-get install -y git mariadb-client

WORKDIR /web