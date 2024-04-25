FROM node:16.6.1-alpine3.14
#RUN addgroup app && adduser -S -G app app app
#RUN mkdir app && chown app:app /app
#USER app 
# WORKDIR /app
COPY package.json .
RUN npm install
# RUN npm install -g sequelize@6.6.2
# RUN npm install -g sequelize-cli@6.6.2
# RUN npm install -g ts-node@10.9.1
# RUN apk update && apk add bash
RUN apk add --no-cache bash
COPY . .
# COPY ../migrations/ .
# RUN ls -la

CMD ["npm","run","dev"]