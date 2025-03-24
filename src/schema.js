const fs = require('fs');
const path = require('path');
const { buildSchema } = require('graphql');

const schemaString = fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8');

const schema = buildSchema(schemaString);

module.exports = schema;
