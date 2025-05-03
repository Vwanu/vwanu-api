variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for the domain"
  type        = string
}

variable "domain_name" {
  description = "Main domain name managed in Cloudflare"
  type        = string
}

variable "api_subdomain" {
  description = "Subdomain for the API"
  type        = string
  default     = "api"
}

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

# Create CNAME record for API subdomain pointing to ALB
resource "cloudflare_record" "api_cname" {
  zone_id         = var.cloudflare_zone_id
  name            = var.api_subdomain
  content         = aws_lb.app.dns_name
  type            = "CNAME"
  proxied         = true
  allow_overwrite = true
  ttl             = 1 # Auto
}

# Output the API URL
output "api_url" {
  value = "https://${var.api_subdomain}.${var.domain_name}"
  description = "The URL for the API"
} 