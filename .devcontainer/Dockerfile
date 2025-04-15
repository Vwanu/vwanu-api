FROM node:18-bullseye

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

# Configure npm to use a custom global directory to avoid permission issues
RUN mkdir -p /home/node/.npm-global && \
    npm config set prefix '/home/node/.npm-global' && \
    echo "export PATH=/home/node/.npm-global/bin:\$PATH" >> /home/node/.bashrc

# Install ts-node and nodemon globally
RUN npm install -g ts-node typescript nodemon

# Create and set working directory
WORKDIR /workspace

# Set default command
CMD ["sleep", "infinity"] 