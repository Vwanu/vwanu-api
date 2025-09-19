#!/bin/bash

# Deploy to development environment
# Usage:
#   Local: bash deploy-dev.sh
#   With specific image: bash deploy-dev.sh IMAGE_TAG

set -e

echo "🚀 Deploying vwanu-server to development environment..."

# Load environment variables
if [ -f .env.dev ]; then
    export $(cat .env.dev | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded from .env.dev"
else
    echo "❌ .env.dev file not found. Please create it from .env.example"
    exit 1
fi

# Determine image tag to deploy
if [ -n "$1" ]; then
    # Use provided image tag
    IMAGE_TAG="$1"
    echo "🔧 Using provided image tag: $IMAGE_TAG"
elif [ -f .image-tag ]; then
    # Load from file created by build script
    source .image-tag
    echo "🔧 Using image tag from build: $IMAGE_TAG"
else
    # Fallback to latest
    IMAGE_TAG="latest"
    echo "🔧 No specific tag provided, using: $IMAGE_TAG"
fi

DOCKER_IMAGE_URI="330795642424.dkr.ecr.us-east-1.amazonaws.com/vwanu-server:$IMAGE_TAG"
echo "🐳 Deploying with image: $DOCKER_IMAGE_URI"

# Deploy using serverless with vwanu profile (pure CloudFormation)
echo "📦 Deploying infrastructure with Serverless Framework..."
serverless deploy \
    --stage dev \
    --region us-east-1 \
    --aws-profile vwanu \
    --param="dockerImage=$DOCKER_IMAGE_URI" \
    --verbose

echo "✅ Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check the deployment in AWS Console"
echo "2. Run database migrations if needed"
echo "3. Test the API endpoints"
echo ""
echo "📍 Resources created:"
echo "- VPC and networking"
echo "- RDS PostgreSQL database (publicly accessible)"
echo "- ECS Fargate cluster"
echo "- Application Load Balancer"
echo "- S3 bucket for uploads"
echo "- Cognito User Pool"
echo "- Parameter Store values"
echo ""
echo "🐳 Deployed image: $DOCKER_IMAGE_URI"