FROM node:alpine

# set working directory
WORKDIR /app

COPY . .

RUN npm install --silent

RUN npm run build

# start app
CMD ["npm", "serve -s dist"]