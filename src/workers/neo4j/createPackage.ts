import { GitlabProject } from '../../models/GitlabProject';
import { PackageJson } from '../../models/PackageJson';

export function createPackage(tx, project: GitlabProject, packageJson: PackageJson): void {
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
}
