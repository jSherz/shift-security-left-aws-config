import { App, Octokit } from "octokit";
import { AxiosInstance } from "axios";
import { PullRequestSimple } from "./github.types";
import { logger } from "./powertools";

export interface IGitHubService {
  addMergeRequestComment(
    project: string,
    ref: string,
    comment: string,
  ): Promise<void>;
}

/**
 * This service is a wrapper around the GitHub library Octokit. It
 * authenticates as a GitHub App and assumes that you've made a private app for
 * your organization - it doesn't work with multi-tenancy.
 */
export class GitHubService implements IGitHubService {
  private octokit?: Octokit;

  constructor(
    private readonly secretName: string,
    private readonly axios: AxiosInstance,
  ) {}

  private async getOctokit(): Promise<Octokit> {
    if (!this.octokit) {
      // This uses the Lambda layer provided by AWS to fetch and cache secrets
      const gitHubAuthSecret = await this.axios.get<{ SecretString: string }>(
        `http://localhost:2773/secretsmanager/get?secretId=${this.secretName}`,
      );

      const { appId, privateKey, installationId } = JSON.parse(
        gitHubAuthSecret.data.SecretString,
      );

      const app = new App({
        appId,
        privateKey,
      });

      this.octokit = await app.getInstallationOctokit(installationId);
    }

    return this.octokit;
  }

  async addMergeRequestComment(
    project: string,
    ref: string,
    comment: string,
  ): Promise<void> {
    const octokit = await this.getOctokit();

    const [owner, repo] = project
      .replace("git@github.com:", "")
      .replace(".git", "")
      .split("/");

    const relevantPullsResponse = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls?state={state}",
      {
        owner,
        repo,
        state: "open",
        head: ref,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    const relevantPulls = relevantPullsResponse.data as PullRequestSimple[];

    if (relevantPulls.length === 1) {
      const issueNumber = relevantPulls[0].number;

      await octokit.request(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
        {
          owner,
          repo,
          issue_number: issueNumber,
          body: comment,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
      );

      logger.info("added comment to issue", {
        issueNumber,
      });
    } else {
      logger.warn("expected to find one relevant pull request", {
        numRelevantPulls: relevantPulls.length,
        owner,
        repo,
      });
    }
  }
}
