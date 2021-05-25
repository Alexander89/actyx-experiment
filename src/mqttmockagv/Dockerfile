FROM node:10-alpine as build
WORKDIR /usr/src/app

COPY src/mqttmockagv/package-prod.json ./package.json
RUN npm install --production
COPY build/mqttmockagv/. .

FROM node:10-alpine
COPY --from=build /usr/src/app /
CMD ["node", "mqttmockagv/index.js"]
