FROM node:23-alpine3.20 as builder

WORKDIR /build
COPY . .
RUN npm install
RUN npm run build

FROM node:23-alpine3.20 as runtime

ENV TZ=Europe/Stockholm

WORKDIR /opt/next-departure
COPY --from=builder /build/dist/ ./dist
COPY --from=builder /build/node_modules/ ./node_modules

CMD node /opt/next-departure/dist/src/app.js

EXPOSE 3000

