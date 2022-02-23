# git-dependency-analysis-tool

Simple Node.js tool for reading the projects in your organisation's GitLab, and populating the data in a Neo4j graph database. 
This allows you to write powerful Cypher queries to find out dependencies, specific versions, etc... (see below for examples).

**WORK IN PROGRESS**

TODOs
- Read multiple project pages
- Better logger
- More docs, more queries
- Clean up code
- Unit tests
- GitHub integration

## Installation

### Node modules

This project requires at least Node version 14: https://nodejs.org/en/

After cloning the repo, install the `node_modules` folder with `npm install`.

### Environment config

Copy/paste the `.env.TEMPLATE` file to `.env` and fill in the required configuration.

Currently we only support the Gitlab API.

### Neo4j

Neo4j is an open source graph database, learn more here: https://neo4j.com/

To run a local Neo4j instance in a Docker container, you need to install Docker first: https://www.docker.com/

Start the Neo4j Docker image with `npm run start:neo4j`

After starting the Neo4j container, navigate to http://localhost:7474/

Log in using the username `neo4j` and password `neo4j`. You will be asked to configure a new password. 
Note it down and change the `.env` file.

## Running the script

After configuring the `.env` file, run the script to populate your local Neo4j instance with `npm start`.

## Useful Queries

More documentation about Cypher queries here: https://neo4j.com/developer/cypher/

### Return everything

Can return a lot of results, depending on the size of your organisation. Use with caution!

`MATCH (n) RETURN n`

### Return everything that depends on Angular

`MATCH (n)-[r:DEPENDS_ON]->(d:Dependency {name: "@angular/core"}) RETURN n, d`

### Return everything that depends on Angular 12 or higher

`MATCH (n)-[r:DEPENDS_ON]->(d:Dependency {name: "@angular/core"}) WHERE r.version =~ "^[>\^~ ]?12.*" RETURN n, d`

### Return only the Gitlab projects that depends on Angular 12 or higher

Could be useful when we start adding Github or Bitbucket projects as well...

`MATCH (p:Project)-[CONTAINS]->()-[r:DEPENDS_ON]->(d:Dependency {name: "@angular/core"}) WHERE p.type = "Gitlab" AND r.version =~ "^[>\^~ ]?12.*" RETURN p`

### Return any project that directly or indirectly depends on a specific dependency

`MATCH (p:Project)-[CONTAINS]->()-[r:DEPENDS_ON*]->(d:Dependency {name: "@angular/core"}) RETURN p`

### Return the Angular versions for all projects that were last active before the 21st of December, 2021

`MATCH (p:Project)-[:CONTAINS]->(:Package)-[r:DEPENDS_ON]->(d:Dependency { name: "@angular/core" }) WHERE p.last_activity_at < Date({ year: 2020, month: 12, day: 21}) RETURN r.version`

### Return any project name WITHOUT a package.json

Useful for e.g. excluding these projects from the analysis in the future...

`MATCH (p:Project) WHERE NOT (p)-[:CONTAINS]->(:Package) RETURN p.name`

### Delete everything

Useful for clearing everything before re-importing. Use with caution!

`MATCH (n) DETACH DELETE n`
