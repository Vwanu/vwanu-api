#!/bin/bash
set -e

# Configuration
ECR_REPO="058264272613.dkr.ecr.us-east-1.amazonaws.com/vwanu-api-backend"
IMAGE_TAG="test-express-$(date +%s)"
ECS_CLUSTER="my-ecs-cluster"
ECS_SERVICE="app-service-v2"
ALB_URL="http://app-lb-1222210323.us-east-1.elb.amazonaws.com"

echo "==== Building Test Express API Docker Image ===="
# Add --load to make the image available locally
docker buildx build --platform linux/amd64 --load -t test-express-api:${IMAGE_TAG} .

echo "==== Pushing to ECR ===="
# Login to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin $(echo $ECR_REPO | cut -d/ -f1)

# Tag and push the image
docker tag test-express-api:${IMAGE_TAG} ${ECR_REPO}:${IMAGE_TAG}
docker push ${ECR_REPO}:${IMAGE_TAG}

# Also tag as test-express-latest
docker tag test-express-api:${IMAGE_TAG} ${ECR_REPO}:test-express-latest
docker push ${ECR_REPO}:test-express-latest

echo "==== Updating Task Definition ===="
# Create a temporary task definition JSON
cat > task-def.json << EOF
{
  "family": "my-app-task-v2",
  "networkMode": "awsvpc",
  "executionRoleArn": "arn:aws:iam::058264272613:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "vwanu-api-backend",
      "image": "${ECR_REPO}:${IMAGE_TAG}",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 4000,
          "hostPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "PORT",
          "value": "4000"
        },
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "healthCheck": {
        "command": ["CMD-SHELL", "wget -qO- http://localhost:4000/ || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 10
      },
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/vwanu-api-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs",
          "awslogs-create-group": "true"
        }
      }
    }
  ],
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512"
}
EOF

# Register the new task definition
aws ecs register-task-definition --cli-input-json file://task-def.json

# Update the service to use the new task definition
echo "==== Updating ECS Service ===="
aws ecs update-service --cluster ${ECS_CLUSTER} --service ${ECS_SERVICE} --task-definition my-app-task-v2 --force-new-deployment

echo "==== Deployment Started ===="
echo "The deployment has been triggered. It may take a few minutes for the new tasks to start."
echo "You can check your application at: ${ALB_URL}" 