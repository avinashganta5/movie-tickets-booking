project_name = "myproject"

vpc_cidr = "10.0.0.0/16"

public_subnets = {
  public-1 = {
    cidr = "10.0.1.0/24"
    az   = "us-east-1a"
  }

  public-2 = {
    cidr = "10.0.2.0/24"
    az   = "us-east-1b"
  }
}

private_subnets = {
  private-1 = {
    cidr = "10.0.11.0/24"
    az   = "us-east-1a"
  }

  private-2 = {
    cidr = "10.0.12.0/24"
    az   = "us-east-1b"
  }
}

ec2_instances = {
  web-1 = {
    ami_id           = "ami-0d27e0fb3bac4d724"
    instance_type    = "t3.micro"
    subnet_name      = "public-1"
    key_name         = "nginx"
    root_volume_size = 20
  }

  web-2 = {
    ami_id           = "ami-0d27e0fb3bac4d724"
    instance_type    = "t3.micro"
    subnet_name      = "public-2"
    key_name         = "nginx"
    root_volume_size = 20
  }
}


security_groups = {
  web-sg = {
    description = "Security group for public web servers"

    ingress_rules = [
      {
        description = "HTTP"
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      },

      {
        description = "HTTPS"
        from_port   = 443
        to_port     = 443
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      },

      {
        description = "SSH"
        from_port   = 22
        to_port     = 22
        protocol    = "tcp"
        cidr_blocks = ["YOUR_PUBLIC_IP/32"]
      }
    ]

    egress_rules = [
      {
        description = "Allow outbound traffic"
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
      }
    ]
  }
}

