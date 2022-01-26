import axios, { AxiosResponse } from 'axios';

import { config } from '../../config/config';
import { GitlabProject } from '../../models/GitlabProject';

export function getProjects(page: number): Promise<GitlabProject[]> {
  console.log('getProjects', { page });
  return axios
    .get<GitlabProject[]>(config.GITLAB_API.LIST_PROJECTS.replace(':page', `${page}`), {
      headers: {
        'PRIVATE-TOKEN': config.GITLAB_API.TOKEN,
      },
    })
    .then((result: AxiosResponse<GitlabProject[]>) => {
      return result.data;
    });
}
