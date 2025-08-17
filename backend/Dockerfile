FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

FROM node:18-alpine

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

COPY --from=build /app ./

USER node

EXPOSE ${PORT}

CMD ["node", "server.js"]
