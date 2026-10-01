# -----------------------------
# VPC
# -----------------------------

resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "VPC-${var.project_name}"
  }
}


# -----------------------------
# Public Subnets
# -----------------------------

resource "aws_subnet" "public_subnets" {
  for_each = var.public_subnets

  vpc_id                  = aws_vpc.this.id
  cidr_block              = each.value.cidr
  availability_zone       = each.value.az
  map_public_ip_on_launch = true

  tags = {
    Name = each.key
  }
}


# -----------------------------
# Private Subnets
# -----------------------------

resource "aws_subnet" "private_subnets" {
  for_each = var.private_subnets

  vpc_id            = aws_vpc.this.id
  cidr_block        = each.value.cidr
  availability_zone = each.value.az

  tags = {
    Name = each.key
  }
}


# -----------------------------
# Internet Gateway
# -----------------------------

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "IGW-${var.project_name}"
  }
}


# -----------------------------
# Public Route Table
# -----------------------------

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "Public-RT-${var.project_name}"
  }
}


# -----------------------------
# Public Route Table Association
# -----------------------------

resource "aws_route_table_association" "public_rt_association" {
  for_each = aws_subnet.public_subnets

  route_table_id = aws_route_table.public_rt.id
  subnet_id      = each.value.id
}


# -----------------------------
# Elastic IP for NAT Gateway
# -----------------------------

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "NAT-EIP-${var.project_name}"
  }
}


# -----------------------------
# NAT Gateway
# -----------------------------

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id

  # NAT Gateway MUST be inside a public subnet
  subnet_id = values(aws_subnet.public_subnets)[0].id

  depends_on = [
    aws_internet_gateway.igw
  ]

  tags = {
    Name = "NAT-${var.project_name}"
  }
}


# -----------------------------
# Private Route Table
# -----------------------------

resource "aws_route_table" "private_rt" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name = "Private-RT-${var.project_name}"
  }
}


# -----------------------------
# Private Route Table Association
# -----------------------------

resource "aws_route_table_association" "private_rt_association" {
  for_each = aws_subnet.private_subnets

  route_table_id = aws_route_table.private_rt.id
  subnet_id      = each.value.id
}
