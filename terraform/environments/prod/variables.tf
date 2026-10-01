variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
}

variable "public_subnets" {
  description = "Public subnet configuration"

  type = map(object({
    cidr = string
    az   = string
  }))
}

variable "private_subnets" {
  description = "Private subnet configuration"

  type = map(object({
    cidr = string
    az   = string
  }))
}

variable "ec2_instances" {
  description = "EC2 instance configuration"

  type = map(object({
    ami_id           = string
    instance_type    = string
    subnet_name      = string
    key_name         = string
    root_volume_size = number
  }))
}

variable "security_groups" {
  description = "Development security groups"

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

variable "security_group_ids" {
  description = "Security group IDs for EC2 instances"
  type        = list(string)
}