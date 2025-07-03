environment = "dev"

# Infrastructure settings
vpc_cidr                = "10.0.0.0/16"
availability_zone_count = 2

# Database settings
db_instance_class = "db.t3.micro"
db_name          = "vwanu_api_dev"
db_username      = "postgres"
# db_password will be set via environment variable or prompt

# EC2 settings
instance_type     = "t3.micro"
min_instances     = 1
max_instances     = 2
desired_instances = 1

# Application settings
api_port     = 4000
docker_image = "058264272613.dkr.ecr.us-east-1.amazonaws.com/vwanu-api:test-simple"

# Domain settings
subdomain = "api-dev"

# SSL Certificate ARN - we'll need to create this first
# For now, let's create a wildcard cert for *.wadsonvaval.click
certificate_arn = "arn:aws:acm:us-east-1:058264272613:certificate/placeholder"

# Secrets (set via environment variables)
# cloudinary_api_key = ""
# cloudinary_api_secret = ""
# cloudinary_cloud_name = ""
# jwt_secret = ""
# authentication_secret = "" 