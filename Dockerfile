FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist/grisenobra ./dist/grisenobra
COPY --from=build /app/node_modules ./node_modules
COPY package.json ./
ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/grisenobra/server/server.mjs"]
