import { Date as Neo4jDate } from 'neo4j-driver-core/lib/temporal-types.js'

import { GitlabProject } from '../../models/GitlabProject';
import { createProperties } from '../../functions/createProperties';

export function createProject(tx, project: GitlabProject): void {
  const properties = {
    name: project.name,
    type: 'Gitlab', // TODO enum
    id: project.id,
    web_url: project.web_url || '',
    default_branch: project.default_branch || '',
    created_at: Neo4jDate.fromStandardDate(new Date(project.created_at)) || null,
    last_activity_at: Neo4jDate.fromStandardDate(new Date(project.last_activity_at)) || null,
    empty_repo: project.empty_repo || false,
  };
  console.log(`Creating project "${project.name}"`,createProperties(properties) );
  tx.run(`MERGE (p:Project { ${createProperties(properties)} }) RETURN p`, properties);
}
