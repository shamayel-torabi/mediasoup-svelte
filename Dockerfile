FROM node:22 AS base
RUN set -x \
	&& apt-get update \
	&& apt-get install -y net-tools build-essential python3 python3-pip valgrind

FROM base AS development-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci

FROM base AS production-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM development-env AS build-env
COPY . /app
WORKDIR /app
RUN npm run build

FROM node:22-slim AS production
RUN apt update && apt install libssl-dev -y --no-install-recommends

FROM production
COPY ./package.json package-lock.json /app/
COPY ./server.prod.js /app/server.js
COPY ./socket-server /app/socket-server
COPY --from=production-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
EXPOSE 3000
CMD ["npm", "run", "start"]