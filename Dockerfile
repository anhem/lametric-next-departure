FROM node:24.21.0-alpine3.23 as builder

WORKDIR /build
COPY . .
RUN npm install
RUN npm run build
RUN npm prune --omit=dev

FROM node:24.21.0-alpine3.23 as runtime

ENV TZ=Europe/Stockholm

WORKDIR /opt/next-departure
COPY --from=builder /build/dist/ ./dist
COPY --from=builder /build/node_modules/ ./node_modules

CMD node /opt/next-departure/dist/src/app.js

EXPOSE 3000

