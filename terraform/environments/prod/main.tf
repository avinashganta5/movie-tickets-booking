module "vpc" {
  source = "../../modules/vpc"

  private_subnets = var.private_subnets
  public_subnets = var.public_subnets
  project_name = var.project_name
  vpc_cidr = var.vpc_cidr
}

module "ec2" {
  source = "../../modules/ec2"

  instances = {
    web-1 = {
      ami_id           = var.ec2_instances.ami_id
      instance_type    = "t3.micro"
      subnet_id        = module.vpc.public_subnet_ids["public-1"]
      key_name         = var.ec2_instances.key_name
      root_volume_size = 20
    }

    web-2 = {
      ami_id           = var.ec2_instances.ami_id
      instance_type    = "t3.micro"
      subnet_id        = module.vpc.public_subnet_ids["public-2"]
      key_name         = var.ec2_instances.key_name
      root_volume_size = 20
    }
  }

 security_group_ids = [
    module.sg.security_group_ids["web-sg"]
  ]
}

module "sg" {
  source = "../../modules/sg"

  vpc_id = module.vpc.vpc_id

  security_groups = var.security_groups
}
