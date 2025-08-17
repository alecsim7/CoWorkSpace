output "endpoint" {
  description = "Endpoint of the RDS instance"
  value       = aws_db_instance.this.endpoint
}

output "arn" {
  description = "ARN of the RDS instance"
  value       = aws_db_instance.this.arn
}
