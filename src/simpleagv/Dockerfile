FROM node:10-alpine as build
WORKDIR /usr/src/app

COPY src/simpleagv/package-prod.json ./package.json
RUN npm install --production
COPY build/simpleagv/. .

FROM node:10-alpine
COPY --from=build /usr/src/app /
CMD ["node", "simpleagv/index.js"]
