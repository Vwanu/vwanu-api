#!/bin/bash

# Get the ECR repository URL
ECR_REPO=$(aws ecr describe-repositories --repository-names vwanu-api-backend --query 'repositories[0].repositoryUri' --output text)

if [ -z "$ECR_REPO" ]; then
  echo "Error: Could not find ECR repository. Make sure it exists."
  exit 1
fi

# Log in to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin $(echo $ECR_REPO | cut -d/ -f1)

# Build the Docker image
docker build -t test-nginx .

# Tag the image for ECR
docker tag test-nginx:latest $ECR_REPO:test

# Push the image to ECR
docker push $ECR_REPO:test

echo "Image pushed to $ECR_REPO:test"
echo "Now update your task definition to use this image tag" 