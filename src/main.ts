import dotenv from 'dotenv';
import { spawn, Worker, Thread } from 'threads';

import { GitlabProject } from './models/GitlabProject';
import { getProjects } from './http/gitlab/getProjects';

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

  await getProjects(1)
    .then((projects: GitlabProject[]) => {
      console.log('Got projects', projects.length);
      return processor.createMultipleGitlabProjects(projects);
    })
    .then((result) => {
      console.log('Created', result);
    })
    .finally(() => Thread.terminate(processor));
}

main().catch(console.error);
