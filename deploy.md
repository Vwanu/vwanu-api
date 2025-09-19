# Deployment Guide

This guide explains how to deploy the vwanu social networking backend using the Serverless Framework and AWS CloudFormation.

## Prerequisites

1. **Install Dependencies**
   ```bash
   npm install -g serverless
   npm install
   ```

2. **Configure AWS CLI**
   ```bash
   aws configure
   # Or use AWS profiles: aws configure --profile your-profile
   ```

3. **Install Serverless Plugins**
   ```bash
   serverless plugin install -n serverless-lift
   ```

## Environment Setup

### 1. Create Environment Files

Copy the example environment file for each environment:

```bash
cp .env.example .env.dev
cp .env.example .env.staging
cp .env.example .env.production
```

Fill in the appropriate values for each environment file.

### 2. Set Required Environment Variables

Before deploying, ensure these critical variables are set:

- `DB_PASSWORD`: Secure database password
- `JWT_SECRET`: Strong JWT secret (minimum 32 characters)
- `CLOUDINARY_*`: Cloudinary credentials for media uploads
- OAuth credentials (if using social login)

## Deployment Commands

### Development Environment
```bash
# Deploy to dev environment
serverless deploy --stage dev --region us-east-1

# Deploy with specific AWS profile
serverless deploy --stage dev --region us-east-1 --aws-profile your-profile
```

### Staging Environment
```bash
# Load staging environment variables
export $(cat .env.staging | xargs)

# Deploy to staging
serverless deploy --stage staging --region us-east-1
```

### Production Environment
```bash
# Load production environment variables
export $(cat .env.production | xargs)

# Deploy to production
serverless deploy --stage production --region us-east-1
```

## Post-Deployment Setup

### 1. Database Migration

After the first deployment, run database migrations:

```bash
# Connect to the ECS cluster and run migrations
aws ecs run-task \
  --cluster vwanu-server-{stage}-cluster \
  --task-definition vwanu-server-{stage}-task \
  --overrides '{
    "containerOverrides": [{
      "name": "vwanu-server-{stage}-container",
      "command": ["npm", "run", "migrate"]
    }]
  }' \
  --launch-type FARGATE \
  --network-configuration '{
    "awsvpcConfiguration": {
      "subnets": ["subnet-xxx", "subnet-yyy"],
      "securityGroups": ["sg-xxx"],
      "assignPublicIp": "DISABLED"
    }
  }'
```

### 2. Database Seeding (Optional)

```bash
# Run database seeding
aws ecs run-task \
  --cluster vwanu-server-{stage}-cluster \
  --task-definition vwanu-server-{stage}-task \
  --overrides '{
    "containerOverrides": [{
      "name": "vwanu-server-{stage}-container",
      "command": ["npm", "run", "seed"]
    }]
  }' \
  --launch-type FARGATE \
  --network-configuration '{...}'
```

## Environment-Specific Configurations

### Development
- Single AZ deployment
- Smaller instance sizes
- No read replicas
- Shorter backup retention
- Auto-scaling disabled

### Staging
- Multi-AZ deployment
- Medium instance sizes
- Auto-scaling enabled
- Performance insights disabled
- Moderate backup retention

### Production
- Multi-AZ deployment
- Larger instance sizes
- Read replicas enabled
- Performance insights enabled
- Extended backup retention
- Deletion protection enabled
- Enhanced monitoring

## Container Deployment

### Building and Pushing Docker Image

1. **Build Docker Image**
   ```bash
   docker build -t vwanu-server:latest .
   ```

2. **Tag for ECR**
   ```bash
   # Get ECR login token
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin {account-id}.dkr.ecr.us-east-1.amazonaws.com

   # Tag image
   docker tag vwanu-server:latest {account-id}.dkr.ecr.us-east-1.amazonaws.com/vwanu-server:latest
   ```

3. **Push to ECR**
   ```bash
   docker push {account-id}.dkr.ecr.us-east-1.amazonaws.com/vwanu-server:latest
   ```

### Update ECS Service

After pushing a new image:

```bash
# Force new deployment
aws ecs update-service \
  --cluster vwanu-server-{stage}-cluster \
  --service vwanu-server-{stage}-service \
  --force-new-deployment
```

## Monitoring and Logs

### CloudWatch Logs
```bash
# View application logs
aws logs tail /ecs/vwanu-server-{stage} --follow

# Filter logs
aws logs filter-log-events \
  --log-group-name /ecs/vwanu-server-{stage} \
  --filter-pattern "ERROR"
```

### ECS Service Status
```bash
# Check service status
aws ecs describe-services \
  --cluster vwanu-server-{stage}-cluster \
  --services vwanu-server-{stage}-service
```

## Troubleshooting

### Common Issues

1. **Parameter Store Access**: Ensure ECS task execution role has SSM permissions
2. **Database Connection**: Check security groups and parameter values
3. **Container Health**: Review CloudWatch logs for startup errors
4. **Load Balancer**: Verify target group health checks

### Debug Commands

```bash
# Connect to running container
aws ecs execute-command \
  --cluster vwanu-server-{stage}-cluster \
  --task {task-arn} \
  --container vwanu-server-{stage}-container \
  --interactive \
  --command "/bin/bash"

# View parameter values
aws ssm get-parameters-by-path \
  --path "/vwanu/{stage}/" \
  --recursive \
  --with-decryption
```

## Rollback

### Service Rollback
```bash
# Rollback to previous task definition
aws ecs update-service \
  --cluster vwanu-server-{stage}-cluster \
  --service vwanu-server-{stage}-service \
  --task-definition vwanu-server-{stage}-task:{previous-revision}
```

### Infrastructure Rollback
```bash
# Rollback serverless deployment
serverless rollback --timestamp {timestamp} --stage {stage}
```

## Cleanup

### Remove Environment
```bash
# Remove entire stack
serverless remove --stage {stage}
```

**Warning**: This will delete all resources including databases. Ensure you have backups before removing production environments.

## Security Considerations

1. **Secrets Management**: All sensitive data is stored in Parameter Store with encryption
2. **Network Security**: Resources are deployed in private subnets with security groups
3. **Database Security**: RDS encryption at rest and in transit
4. **Container Security**: Non-root container user, minimal base image
5. **IAM**: Least privilege access principles applied to all roles

## Cost Optimization

- **Development**: Uses t3.micro instances and minimal resources
- **Staging**: Balanced configuration for testing
- **Production**: Optimized for performance and reliability
- **Auto-scaling**: Configured to scale based on demand
- **S3 Lifecycle**: Automatic transition to cheaper storage classes