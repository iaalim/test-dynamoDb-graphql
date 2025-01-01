import { gql } from 'apollo-server';

export const userTypeDefs = gql`
  type User {
    id: String!
    name: String!
    email: String!
  }

  type UserResponse {
    success: Boolean!
    message: String!
    data: User
  }

  type UserResponseList {
    success: Boolean!
    message: String!
    data: [User]
  }

  type Query {
    getUserById(id: String!): UserResponse!
    getUserByEmail(email: String!): UserResponse!
    listUsers: UserResponseList!
  }

  type Mutation {
    createUser(name: String!, email: String!): UserResponse!
    updateUser(id: String!, name: String!, email: String!): UserResponse!
    deleteUser(id: String!): UserResponse!
  }
`;
