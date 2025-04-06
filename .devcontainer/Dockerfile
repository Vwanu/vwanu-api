FROM node:16-bullseye

# Install basic development tools
RUN apt-get update && apt-get install -y \
    bash \
    git \
    curl \
    openssh-client \
    python3 \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Yarn properly for Node 16
RUN corepack enable && \
    corepack prepare yarn@stable --activate

# Install ts-node and nodemon globally
RUN npm install -g ts-node typescript nodemon

# Create and set working directory
WORKDIR /workspace

# Set default command
CMD ["sleep", "infinity"] 