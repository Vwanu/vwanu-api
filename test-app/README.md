# ECS Test Application

A minimal Express.js application for testing ECS Fargate deployments.

## Endpoints

- `GET /health` - Health check endpoint that returns status and timestamp
- `GET /` - Root endpoint that returns a simple message

## Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the application:
```bash
npm start
```

The server will start on port 4000 (or the port specified in PORT environment variable).

## Docker Build

To build the Docker image:
```bash
docker build -t ecs-test-app .
```

To run the container:
```bash
docker run -p 4000:4000 ecs-test-app
``` 