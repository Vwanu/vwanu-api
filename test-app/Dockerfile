FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose port 4000
EXPOSE 4000

# Start the app
CMD ["npm", "start"] 