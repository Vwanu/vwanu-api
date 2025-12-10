# Simple single-stage Dockerfile for debugging
# Build for ARM64 to match ECS Fargate task definition
FROM --platform=linux/arm64 node:20-alpine

# Set the working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NODE_CONFIG_DIR=/app/config
ENV HOST=0.0.0.0

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm install --include=dev

# Ensure TypeScript is available globally as backup
RUN npm install -g typescript

# Copy source code and config explicitly
COPY src ./src
COPY scripts ./scripts
COPY config ./config
COPY migrations ./migrations
COPY tsconfig.json ./
COPY nodemon.json ./

# Build the TypeScript application
RUN npm run build

# Expose the application port
EXPOSE 3000


# Run the application
CMD ["node", "dist/bin/index.js"]
