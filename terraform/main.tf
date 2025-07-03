terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      Project     = var.project_name
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  environment   = var.environment
  project_name  = var.project_name
  vpc_cidr      = var.vpc_cidr
  az_count      = var.availability_zone_count
}

# RDS Module
module "rds" {
  source = "./modules/rds"
  
  environment          = var.environment
  project_name         = var.project_name
  vpc_id              = module.vpc.vpc_id
  private_subnet_ids  = module.vpc.private_subnet_ids
  db_instance_class   = var.db_instance_class
  db_name             = var.db_name
  db_username         = var.db_username
  db_password         = var.db_password
  ec2_security_group_id = module.ec2.security_group_id
}

# ALB Module
module "alb" {
  source = "./modules/alb"
  
  environment         = var.environment
  project_name        = var.project_name
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  certificate_arn    = var.certificate_arn
}

# EC2 Module
module "ec2" {
  source = "./modules/ec2"
  
  environment           = var.environment
  project_name          = var.project_name
  vpc_id               = module.vpc.vpc_id
  private_subnet_ids   = module.vpc.private_subnet_ids
  target_group_arn     = module.alb.target_group_arn
  instance_type        = var.instance_type
  min_size             = var.min_instances
  max_size             = var.max_instances
  desired_capacity     = var.desired_instances
  
  # Database connection info
  db_host     = module.rds.db_endpoint
  db_name     = var.db_name
  db_username = var.db_username
  db_password = var.db_password
  
  # Application configuration
  api_port              = var.api_port
  docker_image          = var.docker_image
  cloudinary_api_key    = var.cloudinary_api_key
  cloudinary_api_secret = var.cloudinary_api_secret
  cloudinary_cloud_name = var.cloudinary_cloud_name
  jwt_secret           = var.jwt_secret
  authentication_secret = var.authentication_secret
}

# Route 53 Module
module "route53" {
  source = "./modules/route53"
  
  domain_name     = var.domain_name
  subdomain       = var.subdomain
  alb_dns_name    = module.alb.alb_dns_name
  alb_zone_id     = module.alb.alb_zone_id
} 