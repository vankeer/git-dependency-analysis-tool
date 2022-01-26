# git-graph-insights

This is a simple Node.js tool for reading the projects in your organisation's Gitlab, and populating the data in a Neo4j graph database. 
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

## Useful Queries

### Return everything

Can return a lot of results, depending on the size of your organisation. Use with caution!

`MATCH (n) RETURN n`

### Delete everything

Useful for clearing everything before re-importing. Use with caution!

`MATCH (n) DETACH DELETE n`
