import dotenv from 'dotenv';
import { expose } from 'threads';
import neo4j from 'neo4j-driver';

import { GitlabProject } from '../models/GitlabProject';
import { getPackageJson } from '../http/gitlab/getPackageJson';
import { createDependencies } from './neo4j/createDependencies';
import { createPackage } from './neo4j/createPackage';
import { createProject } from './neo4j/createProject';

dotenv.config();

const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'neo4j';

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
const session = driver.session();

/**
 * TODO remove?
 * @param project
 */
async function createGitlabProject(project: GitlabProject): Promise<any> {
  const type = 'Gitlab';
  const result = await session.run('CREATE (p:Project {name: $name, type: $type, id: $id}) RETURN p', {
    name: project.name,
    type,
    id: project.id,
  });
  const singleRecord = result.records[0];
  const node = singleRecord.get(0);
  return node;
}

/**
 * TODO split up into multiple functions
 *
 * @param projects
 */
async function createMultipleGitlabProjects(projects: GitlabProject[]) {
  return session.writeTransaction((tx) => {
    projects.forEach((project) => {
      createProject(tx, project);
    });

    const packages = projects
      .filter((project) => !project.empty_repo)
      .map((project) => {
        return getPackageJson(project.id, project.default_branch, 5000).then((packageJson) => {
          if (packageJson) {
            createPackage(tx, project, packageJson);

            if (packageJson.dependencies) {
              createDependencies(tx, packageJson, 'Dependency', packageJson.dependencies);
            }

            if (packageJson.devDependencies) {
              createDependencies(tx, packageJson, 'DevDependency', packageJson.devDependencies);
            }
          }
        });
      });

    return Promise.all(packages);
  });
}

expose({
  createMultipleGitlabProjects,
  close: () => driver.close(),
});
