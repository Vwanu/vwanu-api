variable "my_ip" {
  description = "Your IP address to access the database"
  type        = string
}

variable "db_password" {
  description = "The master password for the RDS instance"
  type        = string
  sensitive   = true
}