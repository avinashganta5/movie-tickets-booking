output "instance_ids" {
  description = "EC2 instance IDs"

  value = {
    for name, instance in aws_instance.this :
    name => instance.id
  }
}

output "public_ips" {
  description = "Public IP addresses of EC2 instances"

  value = {
    for name, instance in aws_instance.this :
    name => instance.public_ip
  }
}

output "private_ips" {
  description = "Private IP addresses of EC2 instances"

  value = {
    for name, instance in aws_instance.this :
    name => instance.private_ip
  }
}
