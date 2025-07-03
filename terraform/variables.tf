variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "vwanu-api"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zone_count" {
  description = "Number of availability zones"
  type        = number
  default     = 2
}

# Database variables
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "vwanu_api"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# EC2 variables
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 4
}

variable "desired_instances" {
  description = "Desired number of instances"
  type        = number
  default     = 2
}

# Application variables
variable "api_port" {
  description = "API port"
  type        = number
  default     = 4000
}

variable "docker_image" {
  description = "Docker image to deploy"
  type        = string
  default     = "058264272613.dkr.ecr.us-east-1.amazonaws.com/vwanu-api:ssl-fix"
}

# Cloudinary variables
variable "cloudinary_api_key" {
  description = "Cloudinary API key"
  type        = string
  sensitive   = true
}

variable "cloudinary_api_secret" {
  description = "Cloudinary API secret"
  type        = string
  sensitive   = true
}

variable "cloudinary_cloud_name" {
  description = "Cloudinary cloud name"
  type        = string
  sensitive   = true
}

# Authentication variables
variable "jwt_secret" {
  description = "JWT secret"
  type        = string
  sensitive   = true
}

variable "authentication_secret" {
  description = "Authentication secret"
  type        = string
  sensitive   = true
}

# Domain variables
variable "domain_name" {
  description = "Domain name"
  type        = string
  default     = "wadsonvaval.click"
}

variable "subdomain" {
  description = "Subdomain for API"
  type        = string
  default     = "api"
}

variable "certificate_arn" {
  description = "SSL certificate ARN"
  type        = string
} 