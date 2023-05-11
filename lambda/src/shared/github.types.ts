/*
  Types generated with https://borischerny.com/json-schema-to-typescript-browser/
  from the GitHub API documentation.

  Many fields are stripped for brevity.
 */

export interface SimpleUser {
  name?: string | null;
  email?: string | null;
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  starred_at?: string;
  [k: string]: unknown;
}

export interface Milestone {
  url: string;
  html_url: string;
  labels_url: string;
  id: number;
  node_id: string;
  /**
   * The number of the milestone.
   */
  number: number;
  /**
   * The state of the milestone.
   */
  state: "open" | "closed";
  /**
   * The title of the milestone.
   */
  title: string;
  description: string | null;
  creator: null | SimpleUser;
  open_issues: number;
  closed_issues: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  due_on: string | null;
  [k: string]: unknown;
}

export interface PullRequestSimple {
  url: string;
  id: number;
  node_id: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  number: number;
  state: string;
  locked: boolean;
  title: string;
  user: null | SimpleUser;
  body: string | null;
  labels: {
    id: number;
    node_id: string;
    url: string;
    name: string;
    description: string;
    color: string;
    default: boolean;
    [k: string]: unknown;
  }[];
  milestone: null | Milestone;
  active_lock_reason?: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  assignee: null | SimpleUser;
  assignees?: SimpleUser[] | null;
  requested_reviewers?: SimpleUser[] | null;
  requested_teams?: unknown;
  head: {
    label: string;
    ref: string;
    repo: unknown;
    sha: string;
    user: null | SimpleUser;
    [k: string]: unknown;
  };
  base: {
    label: string;
    ref: string;
    repo: unknown;
    sha: string;
    user: null | SimpleUser;
    [k: string]: unknown;
  };
  _links: unknown;
  author_association: unknown;
  auto_merge: unknown;
  /**
   * Indicates whether or not the pull request is a draft.
   */
  draft?: boolean;
  [k: string]: unknown;
}
