FROM node:16.13.2-buster

MAINTAINER vence2013

COPY sources.list /etc/apt/sources.list
COPY raspi.list   /etc/apt/sources.list.d/raspi.list

RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys '9165938D90FDDD2E' && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys '82B129927FA3303E' && \
    apt-get update && \
    apt-get install -y mariadb-client

ENV NODE_PATH=/usr/local/lib/node_modules

WORKDIR /web
