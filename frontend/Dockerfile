FROM node:alpine

# set working directory
WORKDIR /app

COPY . .

RUN npm install --silent

RUN npm run build
RUN npm install -g serve

# start app
CMD ["npm", "serve -s dist"]