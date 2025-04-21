resource "aws_ecr_repository" "api_repo" {
  name = "vwanu-api-backend"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }
}