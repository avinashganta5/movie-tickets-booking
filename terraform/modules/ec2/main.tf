resource "aws_instance" "this" {
  for_each = var.instances

  ami           = each.value.ami_id
  instance_type = each.value.instance_type

  subnet_id = each.value.subnet_id

  associate_public_ip_address = true

  key_name = each.value.key_name

#   vpc_security_group_ids = var.security_group_ids

  root_block_device {
    volume_size = each.value.root_volume_size
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name = each.key
  }
}
