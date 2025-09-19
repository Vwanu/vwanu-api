#!/bin/bash

# Build and push Docker image to ECR with dynamic tagging
# Usage:
#   Local: bash docker-build-and-push.sh
#   CI/CD: bash docker-build-and-push.sh $GITHUB_SHA

set -e

ECR_REGISTRY="330795642424.dkr.ecr.us-east-1.amazonaws.com"
REPOSITORY_NAME="vwanu-server"
REGION="us-east-1"
AWS_PROFILE="vwanu"

# Determine image tag
if [ -n "$1" ]; then
    # If argument provided (GitHub SHA), use first 8 characters
    IMAGE_TAG=$(echo "$1" | cut -c1-8)
    echo "🔧 Using provided SHA tag: $IMAGE_TAG"
elif [ -n "$GITHUB_SHA" ]; then
    # If running in GitHub Actions
    IMAGE_TAG=$(echo "$GITHUB_SHA" | cut -c1-8)
    echo "🔧 Using GitHub SHA tag: $IMAGE_TAG"
else
    # Generate random tag for local builds
    IMAGE_TAG=$(date +%Y%m%d)-$(openssl rand -hex 4)
    echo "🔧 Generated random tag: $IMAGE_TAG"
fi

FULL_IMAGE_URI="$ECR_REGISTRY/$REPOSITORY_NAME:$IMAGE_TAG"

echo "🔑 Logging into ECR..."
if [ -n "$AWS_PROFILE" ] && [ "$AWS_PROFILE" != "default" ]; then
    aws ecr get-login-password --region $REGION --profile $AWS_PROFILE | docker login --username AWS --password-stdin $ECR_REGISTRY
else
    # For GitHub Actions or environments without profile
    aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
fi

echo "🏗️ Building Docker image..."
docker build -t $REPOSITORY_NAME:$IMAGE_TAG .

echo "🏷️ Tagging image for ECR..."
docker tag $REPOSITORY_NAME:$IMAGE_TAG $FULL_IMAGE_URI

# Also tag as latest for convenience
docker tag $REPOSITORY_NAME:$IMAGE_TAG $ECR_REGISTRY/$REPOSITORY_NAME:latest

echo "📤 Pushing images to ECR..."
docker push $FULL_IMAGE_URI
docker push $ECR_REGISTRY/$REPOSITORY_NAME:latest

echo "✅ Images successfully pushed to ECR!"
echo "📍 Versioned Image URI: $FULL_IMAGE_URI"
echo "📍 Latest Image URI: $ECR_REGISTRY/$REPOSITORY_NAME:latest"

# Export the image tag for use in deployment
echo "IMAGE_TAG=$IMAGE_TAG" > .image-tag
echo "FULL_IMAGE_URI=$FULL_IMAGE_URI" >> .image-tag
echo "💾 Image tag saved to .image-tag file"