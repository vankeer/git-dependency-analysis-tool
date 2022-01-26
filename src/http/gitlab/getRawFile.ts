import axios, { AxiosError, AxiosResponse } from 'axios';

import { config } from '../../config/config';

export function getRawFile(projectId: number, path: string, branch: string): Promise<any | null> {
  const apiUrl = config.GITLAB_API.RAW_FILE.replace(':projectId', `${projectId}`)
    .replace(':path', encodeURIComponent(path))
    .replace(':branch', branch);
  console.log('getRawFile', { projectId, path, apiUrl });
  return axios
    .get<string>(apiUrl, {
      headers: {
        'PRIVATE-TOKEN': config.GITLAB_API.TOKEN,
      },
    })
    .then((result: AxiosResponse<string>) => {
      console.log('Got data');
      return result.data;
    })
    .catch((error: AxiosError) => {
      console.error('Error', error);
      if (error && error.response.status === 404) {
        console.error('Could not find raw file');
        return null;
      }

      console.error('Failed to fetch raw file', error);
      return Promise.reject(error);
    });
}
