import dotenv from 'dotenv';
dotenv.config();

export const config = {
  GITLAB_API: {
    TOKEN: process.env.GITLAB_TOKEN,
    LIST_PROJECTS: process.env.GITLAB_URL + '/api/v4/projects?per_page=100&page=:page',
    RAW_FILE: process.env.GITLAB_URL + '/api/v4/projects/:projectId/repository/files/:path/raw?ref=:branch',
  },
};
