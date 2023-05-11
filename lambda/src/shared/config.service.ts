import {
  ConfigServiceClient,
  SelectResourceConfigCommand,
} from "@aws-sdk/client-config-service";

export interface IConfigService {
  lookupResourceTags(
    resourceType: string,
    resourceId: string,
  ): Promise<Record<string, string>>;
}

interface ILookupResourceTagsQueryResult {
  tags: Array<{ tag: string; key: string; value: string }>;
}

/**
 * This service is a wrapper around AWS Config which looks up tags for a
 * resource when we're notified one has changed.
 */
export class ConfigService implements IConfigService {
  constructor(private readonly configServiceClient: ConfigServiceClient) {}

  async lookupResourceTags(
    resourceType: string,
    resourceId: string,
  ): Promise<Record<string, string>> {
    const response = await this.configServiceClient.send(
      new SelectResourceConfigCommand({
        Expression: `
        SELECT
          tags
        WHERE
          resourceType = '${resourceType}'
          AND resourceId = '${resourceId}'
        `,
        Limit: 100,
      }),
    );

    if (response.Results && response.Results.length === 1) {
      return (
        JSON.parse(response.Results[0]) as ILookupResourceTagsQueryResult
      ).tags.reduce((out, curr) => {
        out[curr.key] = curr.value;
        return out;
      }, {} as Record<string, string>);
    } else {
      return {};
    }
  }
}
