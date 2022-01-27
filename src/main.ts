import dotenv from 'dotenv';
import { spawn, Worker, Thread } from 'threads';

import { getProjects, GetProjectsResponse } from './http/gitlab/getProjects';

dotenv.config();

if (!process.env.GITLAB_URL) {
  throw new Error('Expecting a .env file with a GITLAB_URL !');
}

if (!process.env.GITLAB_TOKEN) {
  throw new Error('Expecting a .env file with a GITLAB_TOKEN !');
}

async function main(): Promise<void> {
  console.log('Starting git-graph-insights import...');
  const processor = await spawn(new Worker('./workers/project-processor'));

  function getAllProjects(page: number) {
    if (page) {
      return getProjects(page, 3000).then((response: GetProjectsResponse) => {
        console.log('Received projects', { length: response.projects.length, nextPage: response.nextPage });
        return processor.createMultipleGitlabProjects(response.projects).then(() => {
          console.log('Processed page', page);
          return getAllProjects(response.nextPage);
        });
      });
    } else {
      // processed all projects
      return null;
    }
  }

  await getAllProjects(1).finally(() => Thread.terminate(processor));
}

main().catch(console.error);
