FROM node:18-alpine
#RUN addgroup app && adduser -S -G app app app
#RUN mkdir app && chown app:app /app
#USER app 
WORKDIR /app
COPY package.json .
RUN npm install -g ts-node typescript nodemon
RUN npm install
COPY . .

# Add health check to the container
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["npm","run","dev"]