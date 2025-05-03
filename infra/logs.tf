resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/ecs/vwanu-api-backend"
  retention_in_days = 30
} 