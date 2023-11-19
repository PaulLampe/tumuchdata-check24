FROM node:alpine

# set working directory
WORKDIR /app

COPY . /app

RUN npm install --silent

RUN npm run build
RUN npm install -g serve
