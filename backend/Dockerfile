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

# Crea la cartella logs e assegna i permessi all'utente node
RUN mkdir -p /app/logs && chown -R node:node /app

USER node

EXPOSE ${PORT}

CMD ["node", "server.js"]
