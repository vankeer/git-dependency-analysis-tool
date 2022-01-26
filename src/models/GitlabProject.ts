export interface GitlabProject {
  id: number;
  name: string;
  path: string;
  created_at: string;
  web_url: string;
  last_activity_at: string;
  visibility: string;
  default_branch: string;
}
