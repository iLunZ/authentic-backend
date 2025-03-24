const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const cors = require("cors");
const dotenv = require("dotenv");
const schema = require("./schema");
const resolvers = require("./resolvers");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  // console.log('Request Headers:', JSON.stringify(req.headers));
  // console.log('Request Body:', JSON.stringify(req.body));
  next();
});

app.use(
  "/graphql",
  graphqlHTTP((req) => {
    console.log("GraphQL request received");
    console.log("Request body:", req.body);
    
    return {
      schema,
      rootValue: resolvers,
      graphiql: true,
      context: { req },
      customFormatErrorFn: (error) => {
        console.error('GraphQL Error:', error);
        return {
          message: error.message,
          locations: error.locations,
          path: error.path,
          stack: process.env.NODE_ENV === 'development' ? error.stack : null,
        };
      },
      extensions: ({ document, variables, operationName, result, context }) => {
        console.log(`GraphQL Operation: ${operationName || 'anonymous'}`);
        console.log('Query:', document ? document.loc?.source.body : 'No document');
        console.log('Variables:', JSON.stringify(variables));
        console.log('Result:', JSON.stringify(result));
        if (result && result.errors) {
          console.error('GraphQL Errors:', result.errors);
        }
        return null;
      },
    };
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
});
