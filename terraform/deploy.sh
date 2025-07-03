#!/bin/bash

set -e

ENVIRONMENT=${1:-dev}
ACTION=${2:-apply}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    print_error "Invalid environment. Use: dev, staging, or prod"
    exit 1
fi

# Validate action
if [[ ! "$ACTION" =~ ^(plan|apply|destroy)$ ]]; then
    print_error "Invalid action. Use: plan, apply, or destroy"
    exit 1
fi

print_status "Starting $ACTION for $ENVIRONMENT environment..."

# Load environment variables from terraform.env file
ENV_FILE="terraform.env"
if [[ -f "$ENV_FILE" ]]; then
    print_status "Loading environment variables from $ENV_FILE"
    set -a  # automatically export all variables
    source "$ENV_FILE"
    set +a  # stop automatically exporting
else
    print_warning "Environment file $ENV_FILE not found. Please create it or set variables manually."
fi

# For the test-simple app, we can use a dummy certificate initially
if [[ "$TF_VAR_certificate_arn" == *"REPLACE_WITH_YOUR_CERT_ID"* ]]; then
    print_warning "Certificate ARN not set. Using placeholder for initial deployment."
    print_warning "You'll need to create an SSL certificate later for HTTPS to work."
    # For now, let's comment out HTTPS requirement and use HTTP only
    export TF_VAR_certificate_arn="arn:aws:acm:us-east-1:058264272613:certificate/dummy-cert-for-testing"
fi

# Check if required environment variables are set
required_vars=(
    "TF_VAR_db_password"
    "TF_VAR_cloudinary_api_key"
    "TF_VAR_cloudinary_api_secret"
    "TF_VAR_cloudinary_cloud_name"
    "TF_VAR_jwt_secret"
    "TF_VAR_authentication_secret"
    "TF_VAR_certificate_arn"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
        missing_vars+=("$var")
    fi
done

if [[ ${#missing_vars[@]} -gt 0 ]]; then
    print_error "Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please check the $ENV_FILE file or set them manually:"
    echo "export TF_VAR_db_password='your-password'"
    echo "export TF_VAR_cloudinary_api_key='your-key'"
    echo "# ... etc"
    exit 1
fi

# Check if tfvars file exists
TFVARS_FILE="environments/$ENVIRONMENT/terraform.tfvars"
if [[ ! -f "$TFVARS_FILE" ]]; then
    print_error "Terraform variables file not found: $TFVARS_FILE"
    exit 1
fi

# Initialize Terraform if needed
if [[ ! -d ".terraform" ]]; then
    print_status "Initializing Terraform..."
    terraform init
fi

# Select or create workspace
print_status "Selecting workspace: $ENVIRONMENT"
terraform workspace select "$ENVIRONMENT" 2>/dev/null || terraform workspace new "$ENVIRONMENT"

# Run terraform command
print_status "Running terraform $ACTION..."

case $ACTION in
    plan)
        terraform plan -var-file="$TFVARS_FILE"
        ;;
    apply)
        terraform apply -var-file="$TFVARS_FILE"
        if [[ $? -eq 0 ]]; then
            print_status "Deployment completed successfully!"
            print_status "Your API will be available at: https://$(terraform output -raw api_url 2>/dev/null || echo "api-$ENVIRONMENT.wadsonvaval.click")"
        fi
        ;;
    destroy)
        print_warning "This will destroy all resources in the $ENVIRONMENT environment!"
        read -p "Are you sure? (yes/no): " -r
        if [[ $REPLY == "yes" ]]; then
            terraform destroy -var-file="$TFVARS_FILE"
            print_status "Resources destroyed successfully!"
        else
            print_status "Destroy cancelled."
        fi
        ;;
esac

print_status "Done!" 