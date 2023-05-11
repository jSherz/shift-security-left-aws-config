resource "aws_xray_sampling_rule" "this" {
  rule_name      = "shift-security-left-aws-config"
  fixed_rate     = 1 # 100%
  host           = "*"
  http_method    = "*"
  priority       = 1000
  reservoir_size = 10
  resource_arn   = "*"
  service_name   = "shift-security-left-aws-config"
  service_type   = "*"
  url_path       = "*"
  version        = 1
}

data "aws_iam_policy_document" "compliance_change_notification_listener" {
  statement {
    sid       = "AllowLookingUpSecrets"
    effect    = "Allow"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = ["*"] # TODO: lock it down!
  }

  statement {
    sid    = "AllowFetchingConfig"
    effect = "Allow"
    actions = [
      "config:BatchGetResourceConfig",
      "config:SelectResourceConfig",
    ]
    resources = ["*"]
  }
}

module "compliance_change_notification_listener" {
  source = "./modules/lambda-function"

  name              = "${var.prefix}-compliance-change-notification-listener"
  description       = "Called when Config evaluates the compliance of a resource."
  entrypoint        = "../lambda/src/handlers/compliance-change-notification-listener/index.ts"
  working_directory = "../lambda"
  iam_policy        = data.aws_iam_policy_document.compliance_change_notification_listener.json
  timeout           = 30

  event_rule_arns = {
    compliance-change-notification = module.compliance_change_notification_listener_event_rule.arn
  }

  env_vars = {
    GITHUB_AUTH_TOKEN_SECRET_ID = "shift-security-left-aws-config-github-token"
    COMPANY_IDENTIFIER          = var.company_identifier
  }

  enable_param_store_secrets_extension = true
}

module "compliance_change_notification_listener_event_rule" {
  source = "./modules/lambda-function-eventbridge-event"

  name                = "${var.prefix}-compliance-change-notification"
  description         = "Listens for resources being marked as non-compliant."
  lambda_function_arn = module.compliance_change_notification_listener.arn

  event_pattern = jsonencode({
    "detail-type" : ["Config Rules Compliance Change"],
    "source" : ["aws.config"],
  })
}
