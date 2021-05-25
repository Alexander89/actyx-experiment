FROM node:10-alpine as build
WORKDIR /usr/src/app

COPY src/agvsimulation/package-prod.json ./package.json
RUN npm install --production
COPY build/agvsimulation/. .

FROM node:10-alpine
COPY --from=build /usr/src/app /
CMD ["node", "agvsimulation/index.js"]
