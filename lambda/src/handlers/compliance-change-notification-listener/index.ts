import { injectLambdaContext } from "@aws-lambda-powertools/logger";
import { captureLambdaHandler } from "@aws-lambda-powertools/tracer";
import middy from "@middy/core";
import { logger, tracer } from "../../shared/powertools";
import { buildHandler } from "./handler";
import axios from "axios";
import { GitHubService } from "../../shared/github.service";
import { ConfigServiceClient } from "@aws-sdk/client-config-service";
import { ConfigService } from "../../shared/config.service";

const companyIdentifier = process.env.COMPANY_IDENTIFIER;

if (!companyIdentifier) {
  throw new Error("You must provide a COMPANY_IDENTIFIER.");
}

const gitHubAuthTokenSecretId = process.env.GITHUB_AUTH_TOKEN_SECRET_ID;

if (!gitHubAuthTokenSecretId) {
  throw new Error("You must provide a GITHUB_AUTH_TOKEN_SECRET_ID.");
}

const gitHubService = new GitHubService(
  gitHubAuthTokenSecretId,
  axios.create({
    headers: {
      "X-Aws-Parameters-Secrets-Token": process.env.AWS_SESSION_TOKEN,
    },
  }),
);

const configServiceClient = new ConfigServiceClient({});

const configService = new ConfigService(configServiceClient);

export const handler = middy(
  buildHandler(companyIdentifier, configService, gitHubService),
)
  .use(injectLambdaContext(logger, { logEvent: true }))
  .use(captureLambdaHandler(tracer, { captureResponse: false }));
