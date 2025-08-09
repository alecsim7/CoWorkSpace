FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE ${PORT}

CMD ["node", "server.js"]
