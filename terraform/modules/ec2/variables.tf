variable "instances" {
  description = "EC2 instances configuration"

  type = map(object({
    ami_id           = string
    instance_type    = string
    subnet_id        = string
    key_name         = string
    root_volume_size = number
  }))
}

variable "security_group_ids" {
  description = "Security group IDs for EC2 instances"
  type        = list(string)
}
