FROM node:20.0-slim

WORKDIR /processor

COPY ./processor .

RUN npm install && npm run build

EXPOSE 8080

CMD [ "npm", "run", "start" ]
