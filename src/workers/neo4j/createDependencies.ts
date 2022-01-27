import { PackageJson } from '../../models/PackageJson';

export function createDependencies(
  tx,
  packageJson: PackageJson,
  type: 'Dependency' | 'DevDependency',
  dependencies: Record<string, string>,
): void {
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
