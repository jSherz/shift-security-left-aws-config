provider "aws" {
  region = "eu-west-1"

  default_tags {
    tags = {
      "${var.company_identifier}:workload:project"   = "git@github.com:jSherz/shift-security-left-aws-config.git"
      "${var.company_identifier}:workload:name"      = "shift-security-left-aws-config"
      "${var.company_identifier}:workload:ref"       = var.ref
      "${var.company_identifier}:devops:environment" = terraform.workspace
    }
  }
}
