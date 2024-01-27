FROM node:21.5.0-alpine3.19 as base
WORKDIR /app

RUN apk update \ 
    && apk add --no-cache g++ make py3-pip libc6-compat \
    && apk add --no-cache tini

COPY package*.json ./

FROM base as builder
WORKDIR /app

RUN npm install

COPY . .
RUN npm run build


FROM base as production
WORKDIR /app

ENV NODE_ENV=production
RUN npm ci

RUN addgroup -g 1001 -S nodejs \
    && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

ENV PORT=8000
ENTRYPOINT [ "/sbin/tini", "--" ]
CMD [ "node", "server.js" ]
