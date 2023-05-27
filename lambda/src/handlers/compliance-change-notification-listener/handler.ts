import type { Context } from "aws-lambda";
import { logger } from "../../shared/powertools";
import * as z from "zod";
import { IGitHubService } from "../../shared/github.service";
import { IConfigService } from "../../shared/config.service";

export const eventParser = z.object({
  version: z.literal("0"),
  id: z.string(),
  "detail-type": z.literal("Config Rules Compliance Change"),
  source: z.literal("aws.config"),
  account: z.string(),
  time: z.string(),
  region: z.string(),
  resources: z.unknown(),
  detail: z.object({
    resourceId: z.string(),
    awsRegion: z.string(),
    awsAccountId: z.string(),
    configRuleName: z.string(),
    recordVersion: z.string(),
    configRuleARN: z.string(),
    messageType: z.string(),
    newEvaluationResult: z.object({
      evaluationResultIdentifier: z.object({
        evaluationResultQualifier: z.object({
          configRuleName: z.string(),
          resourceType: z.string(),
          resourceId: z.string(),
          evaluationMode: z.string(),
        }),
        orderingTimestamp: z.string(),
      }),
      complianceType: z.string(),
      resultRecordedTime: z.string(),
      configRuleInvokedTime: z.string(),
    }),
    oldEvaluationResult: z
      .object({
        evaluationResultIdentifier: z.object({
          evaluationResultQualifier: z.object({
            configRuleName: z.string(),
            resourceType: z.string(),
            resourceId: z.string(),
            evaluationMode: z.string(),
          }),
          orderingTimestamp: z.string(),
        }),
        complianceType: z.string(),
        resultRecordedTime: z.string(),
        configRuleInvokedTime: z.string(),
      })
      .optional(),
    notificationCreationTime: z.string(),
    resourceType: z.string(),
  }),
});

export function buildHandler(
  companyIdentifier: string,
  configService: IConfigService,
  gitHubService: IGitHubService,
) {
  return async function unwrappedHandler(
    event: Record<string, unknown>,
    context: Context,
  ) {
    const parsedEvent = eventParser.parse(event);

    if (
      parsedEvent.detail.newEvaluationResult.complianceType !== "NON_COMPLIANT"
    ) {
      logger.info(
        "we're only interested in NON_COMPLIANT resources - skipping",
        {
          complianceType: parsedEvent.detail.newEvaluationResult.complianceType,
        },
      );
      return;
    }

    const { resourceId, resourceType } =
      parsedEvent.detail.newEvaluationResult.evaluationResultIdentifier
        .evaluationResultQualifier;

    const tags = await configService.lookupResourceTags(
      resourceType,
      resourceId,
    );

    const project = tags[`${companyIdentifier}:workload:project`];
    const ref = tags[`${companyIdentifier}:workload:ref`];

    if (ref === "main") {
      logger.info("not for a pull request - skipping", { ref });
      return;
    }

    if (project && ref) {
      const rule = parsedEvent.detail.configRuleName;
      const region = parsedEvent.detail.awsRegion;

      const ruleUrl = `https://${region}.console.aws.amazon.com/config/home?region=${region}#/rules/details?configRuleName=${encodeURIComponent(
        rule,
      )}`;
      const resourceUrl = `https://${region}.console.aws.amazon.com/config/home?region=${region}#/resources/details?resourceId=${encodeURIComponent(
        resourceId,
      )}&resourceName=${encodeURIComponent(
        resourceId,
      )}&resourceType=${encodeURIComponent(resourceType)}`;

      await gitHubService.addMergeRequestComment(
        project,
        ref,
        `Resource of type ${resourceType} with ID ${resourceId} failed ` +
          `Config rule ${rule} - [Config Rule](${ruleUrl}) - ` +
          `[Resource](${resourceUrl})`,
      );

      logger.info("added merge request comment", {
        resourceType,
        resourceId,
        nonCompliantConfigRule: rule,
      });
    } else {
      logger.warn("resource missing required tags - ignoring", {
        resourceId,
        resourceType,
        tags,
      });
    }
  };
}
