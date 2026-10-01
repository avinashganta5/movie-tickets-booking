variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "security_groups" {
  description = "Security group configuration"

  type = map(object({
    description = string

    ingress_rules = list(object({
      description = string
      from_port   = number
      to_port     = number
      protocol    = string
      cidr_blocks = list(string)
    }))

    egress_rules = list(object({
      description = string
      from_port   = number
      to_port     = number
      protocol    = string
      cidr_blocks = list(string)
    }))
  }))
}
