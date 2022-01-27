import { PackageJson } from '../../models/PackageJson';
import { getRawFile } from './getRawFile';

export function getPackageJson(projectId: number, branch = 'master', maxTimeout = 0): Promise<PackageJson | null> {
  console.log('getPackageJson', projectId);
  const timeout = Math.floor(Math.random() * maxTimeout); // to prevent accidentally DoS-ing the API
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  }).then(() => getRawFile(projectId, 'package.json', branch))
    .then((result) => {
      if (!result) {
        return null;
      }
      console.log('Got package.json', result.name);
      return result as PackageJson;
    })
    .catch((_error) => {
      console.error('Failed to parse package.json');
      return null;
    });
}
