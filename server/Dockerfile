FROM node:12

ADD ./ /server/

WORKDIR /server/
RUN npm install
RUN apt-get -q update && apt-get -qy install netcat



# FROM ubuntu:18.04
# COPY ./wait-for-it.sh /usr/bin/wait-for-it.sh
# CMD ["echo", "!!!!!!!! Container_A is available now !!!!!!!!"]
