FROM node:21.5.0-alpine3.19 as build

RUN apk update \
    && apk add --no-cache g++ make py3-pip libc6-compat

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./
RUN npm install

COPY --chown=node:node . .
RUN npm run build

FROM node:21.5.0-alpine3.19 as base

RUN apk update \
    && apk add --no-cache tini \
    && apk add --no-cache postgresql-client

WORKDIR /usr/src/app

COPY --chown=node:node config.sh .
ENV NODE_ENV production

FROM base as production

COPY --chown=node:node --from=build /usr/src/app/package*.json ./
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/prisma ./prisma
COPY --chown=node:node --from=build /usr/src/app/uploads ./uploads

RUN npm ci ---omit=dev && npm cache clean --force

RUN chown -R node:node ./node_modules

USER node

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "sh", "config.sh", "node", "dist/main.js" ]