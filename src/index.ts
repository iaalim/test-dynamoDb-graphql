import { ApolloServer } from 'apollo-server';
import { typeDefs } from './graphql/typeDefs';
import { resolvers } from './graphql/resolvers';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return { req };
  },
});

server.listen().then(({ url }) => {
  console.log(`Server is running on ${url}`);
});
