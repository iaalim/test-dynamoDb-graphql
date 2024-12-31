import { gql } from 'apollo-server';

export const userTypeDefs = gql`
  type User {
    id: String!
    name: String!
    email: String!
  }

  type Query {
    getUserById(id: String!): User
    getUserByEmail(email: String!): User
    listUsers: [User!]!
  }

  type Mutation {
    createUser(name: String!, email: String!): User
    updateUser(id: String!, name: String!, email: String!): User
    deleteUser(id: String!): Boolean
  }
`;
