import { PackageJson } from '../../models/PackageJson';
import { getRawFile } from './getRawFile';

export function getPackageJson(projectId: number, branch = 'master'): Promise<PackageJson | null> {
  console.log('getPackageJson', { projectId, branch });
  return getRawFile(projectId, 'package.json', branch)
    .then((result) => {
      console.log(result);
      if (!result) {
        return null;
      }
      console.log('Got package.json', { projectId, name: result.name });
      return result as PackageJson;
    })
    .catch((error) => {
      console.error('Failed to parse package.json', error);
      return null;
    });
}
