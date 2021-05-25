FROM node:10-alpine as build
WORKDIR /usr/src/app

COPY src/agv/package-prod.json ./package.json
RUN npm install --production
COPY build/agv/. .

FROM node:10-alpine
COPY --from=build /usr/src/app /
CMD ["node", "agv/index.js"]
