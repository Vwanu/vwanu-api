# VWANU API Infrastructure

This Terraform configuration sets up a scalable, highly available infrastructure for the VWANU API on AWS.

## Architecture

- **VPC**: Custom VPC with public and private subnets across 2 availability zones
- **EC2**: Auto-scaling group with EC2 instances running Docker containers
- **RDS**: PostgreSQL database in private subnets
- **ALB**: Application Load Balancer with SSL termination
- **Route 53**: DNS management for custom domain
- **Auto Scaling**: Based on CPU utilization metrics

## Prerequisites

1. **AWS CLI configured** with appropriate credentials
2. **Terraform installed** (version >= 1.0)
3. **SSL Certificate** created in AWS Certificate Manager for your domain
4. **Route 53 hosted zone** for your domain (wadsonvaval.click)
5. **Docker image** pushed to ECR repository

## Environment Setup

### 1. SSL Certificate
Create an SSL certificate in AWS Certificate Manager:
```bash
aws acm request-certificate \
  --domain-name "*.wadsonvaval.click" \
  --domain-name "wadsonvaval.click" \
  --validation-method DNS \
  --region us-east-1
```

### 2. Set Environment Variables
```bash
export TF_VAR_db_password="your-secure-password"
export TF_VAR_cloudinary_api_key="your-cloudinary-key"
export TF_VAR_cloudinary_api_secret="your-cloudinary-secret"
export TF_VAR_cloudinary_cloud_name="your-cloudinary-cloud"
export TF_VAR_jwt_secret="your-jwt-secret"
export TF_VAR_authentication_secret="your-auth-secret"
export TF_VAR_certificate_arn="arn:aws:acm:us-east-1:058264272613:certificate/your-cert-id"
```

## Deployment

### Development Environment
```bash
cd terraform
terraform init
terraform workspace new dev || terraform workspace select dev
terraform plan -var-file="environments/dev/terraform.tfvars"
terraform apply -var-file="environments/dev/terraform.tfvars"
```

### Staging Environment
```bash
terraform workspace new staging || terraform workspace select staging
terraform plan -var-file="environments/staging/terraform.tfvars"
terraform apply -var-file="environments/staging/terraform.tfvars"
```

### Production Environment
```bash
terraform workspace new prod || terraform workspace select prod
terraform plan -var-file="environments/prod/terraform.tfvars"
terraform apply -var-file="environments/prod/terraform.tfvars"
```

## Quick Deploy Script

Use the provided deploy script:
```bash
./deploy.sh dev
./deploy.sh staging
./deploy.sh prod
```

## Accessing the Application

After deployment:
- **Dev**: https://api-dev.wadsonvaval.click
- **Staging**: https://api-staging.wadsonvaval.click
- **Production**: https://api.wadsonvaval.click

## Monitoring

The infrastructure includes:
- CloudWatch alarms for CPU utilization
- Auto-scaling policies
- ALB health checks targeting `/health` endpoint
- CloudWatch agent for EC2 monitoring

## Updating the Application

To deploy a new Docker image:
1. Build and push the new image to ECR
2. Update the `docker_image` variable in the appropriate environment file
3. Run `terraform apply` again

## Cleanup

To destroy an environment:
```bash
terraform workspace select <environment>
terraform destroy -var-file="environments/<environment>/terraform.tfvars"
```

## Security Features

- EC2 instances in private subnets
- RDS in private subnets with security group restrictions
- ALB with SSL termination
- IAM roles with minimal required permissions
- Security groups with least privilege access

## Cost Optimization

- Uses t3.micro instances for dev (free tier eligible)
- Auto-scaling to handle traffic spikes efficiently
- gp2 storage for RDS with auto-scaling enabled
- NAT Gateways only in required AZs

## Troubleshooting

### Health Check Failures
```bash
# SSH to instance (if needed)
aws ec2 describe-instances --filters "Name=tag:Name,Values=vwanu-api-dev-instance"

# Check container logs
docker logs api-container

# Check health endpoint
curl http://localhost:4000/health
```

### Database Connection Issues
- Verify security group rules
- Check RDS endpoint in environment variables
- Ensure SSL configuration matches database setup

## Module Structure

```
modules/
├── vpc/          # VPC, subnets, routing
├── rds/          # PostgreSQL database
├── alb/          # Application Load Balancer
├── ec2/          # Auto Scaling Group, Launch Template
└── route53/      # DNS management
``` 