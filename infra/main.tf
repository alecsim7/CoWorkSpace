terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "ecr" {
  source = "./modules/ecr"

  repository_name = var.ecr_repository_name
}

module "rds" {
  source = "./modules/rds"

  identifier             = var.rds_identifier
  username               = var.rds_username
  password               = var.rds_password
  subnet_ids             = var.rds_subnet_ids
  vpc_security_group_ids = var.rds_vpc_security_group_ids
}

module "ecs" {
  source = "./modules/ecs"

  cluster_name = var.ecs_cluster_name
}

module "s3" {
  source = "./modules/s3"

  bucket_name = var.s3_bucket_name
}

module "cloudfront" {
  source = "./modules/cloudfront"

  origin_bucket_domain_name = module.s3.bucket_domain_name
}
