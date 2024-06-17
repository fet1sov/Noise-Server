# Docker file
# Noise Web App by fet1sov

FROM node:18-alpine as builder
RUN npm cache clean –force

WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install

# Start serving the web app
CMD ["node", "."]
