variable "identifier" {
  description = "Identifier for the RDS instance"
  type        = string
}

variable "username" {
  description = "Master username"
  type        = string
}

variable "password" {
  description = "Master password"
  type        = string
  sensitive   = true
}

variable "subnet_ids" {
  description = "Subnets for the RDS subnet group"
  type        = list(string)
}

variable "vpc_security_group_ids" {
  description = "Security groups for the RDS instance"
  type        = list(string)
}
