import axios, { AxiosResponse } from 'axios';

import { config } from '../../config/config';
import { GitlabProject } from '../../models/GitlabProject';

export interface GetProjectsResponse {
  nextPage: number | null;
  projects: GitlabProject[];
}

export function getProjects(page: number, timeout = 0): Promise<GetProjectsResponse> {
  console.log('getProjects', page);
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  }).then(() => axios
    .get<GitlabProject[]>(config.GITLAB_API.LIST_PROJECTS.replace(':page', `${page}`), {
      headers: {
        'PRIVATE-TOKEN': config.GITLAB_API.TOKEN,
      },
    }))
    .then((result: AxiosResponse<GitlabProject[]>) => {
      const nextPage: number | null = result.headers['x-next-page'] ? Number(result.headers['x-next-page']) : null;
      return { nextPage, projects: result.data };
    });
}
