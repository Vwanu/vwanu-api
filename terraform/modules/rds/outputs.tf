output "db_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}

output "db_port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "db_security_group_id" {
  description = "RDS security group ID"
  value       = aws_security_group.rds.id
} 