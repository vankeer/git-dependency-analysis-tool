import dotenv from 'dotenv';
import { expose } from 'threads';
import neo4j from 'neo4j-driver';

import { GitlabProject } from '../models/GitlabProject';
import { getPackageJson } from '../http/gitlab/getPackageJson';
import { PackageJson } from '../models/PackageJson';

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

function createDependencies(
  tx,
  packageJson: PackageJson,
  type: 'Dependency' | 'DevDependency',
  dependencies: Record<string, string>,
) {
  Object.keys(dependencies).forEach((dependency) => {
    tx.run(`MERGE (d:${type} {name: $name}) RETURN d`, {
      name: dependency,
    });
    tx.run(
      `MATCH (package:Package), (d:${type}) WHERE package.name = $packageName AND d.name = $depName MERGE (package)-[r:DEPENDS_ON {version: $version}]->(d) RETURN type(r)`,
      {
        packageName: packageJson.name,
        depName: dependency,
        version: dependencies[dependency],
      },
    );
  });
}

/**
 * TODO split up into multiple functions
 *
 * @param projects
 */
async function createMultipleGitlabProjects(projects: GitlabProject[]) {
  console.log('createMultipleGitlabProjects');
  const type = 'Gitlab'; // TODO enum
  return session.writeTransaction((tx) => {
    projects.forEach((project) => {
      console.log(`Creating project "${project.name}"`);
      tx.run('MERGE (p:Project {name: $name, type: $type, id: $id}) RETURN p', {
        name: project.name,
        type,
        id: project.id,
      });
    });

    const packages = projects.map((project) => {
      return getPackageJson(project.id, project.default_branch).then((packageJson) => {
        if (packageJson) {
          console.log(`Creating package "${packageJson.name}"`);
          tx.run('MERGE (p:Package {name: $name}) RETURN p', {
            name: packageJson.name,
          });
          tx.run('MERGE (d:Dependency {name: $name}) RETURN d', {
            name: packageJson.name,
          });
          tx.run(
            'MATCH (p:Package), (d:Dependency) WHERE p.name = $packageName AND d.name = $depName MERGE (p)-[r:CONTAINS]->(d) RETURN type(r)',
            {
              packageName: packageJson.name,
              depName: packageJson.name,
            },
          );
          tx.run(
            'MATCH (project:Project), (package:Package) WHERE project.id = $projectId AND package.name = $packageName MERGE (project)-[r:CONTAINS]->(package) RETURN type(r)',
            {
              projectId: project.id,
              packageName: packageJson.name,
            },
          );

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
  createGitlabProject,
  createMultipleGitlabProjects,
  close: () => driver.close(),
});
