FROM node:14.7.0

WORKDIR /app

COPY ./package.json .
RUN npm cache clean --force
RUN npm install
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]
