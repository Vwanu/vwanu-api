environment = "prod"

# Infrastructure settings
vpc_cidr                = "10.2.0.0/16"
availability_zone_count = 2

# Database settings
db_instance_class = "db.t3.medium"
db_name          = "vwanu_api_prod"
db_username      = "postgres"

# EC2 settings
instance_type     = "t3.medium"
min_instances     = 2
max_instances     = 6
desired_instances = 2

# Application settings
api_port     = 4000
docker_image = "058264272613.dkr.ecr.us-east-1.amazonaws.com/vwanu-api:ssl-fix"

# Domain settings
subdomain = "api" 