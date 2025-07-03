output "hosted_zone_id" {
  description = "Route 53 hosted zone ID"
  value       = data.aws_route53_zone.main.zone_id
}

output "api_fqdn" {
  description = "API fully qualified domain name"
  value       = aws_route53_record.api.fqdn
} 