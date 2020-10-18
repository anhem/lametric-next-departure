FROM node:12
# setup for local build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --save-dev
# copy project files
COPY . .
# build
RUN ./node_modules/.bin/babel server -d dist
ENV REAL_TIME_DEPARTURES_V4_KEY $REAL_TIME_DEPARTURES_V4_KEY

ENTRYPOINT ["node", "dist/app.js"]
EXPOSE 3000