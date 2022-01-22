FROM node:16.13.2-buster

MAINTAINER vence2013

COPY sources.list /etc/apt/sources.list

RUN apt-get update && \
    apt-get install -y mariadb-client

ENV NODE_PATH=/usr/local/lib/node_modules

WORKDIR /web
