import { gql } from 'apollo-server';

export const authTypeDefs = gql`
  type AuthResponse {
    success: Boolean!
    message: String!
    data: AuthData
  }

  type AuthData {
    id: String!
    name: String!
    email: String!
    token: String!
  }

  type Mutation {
    signup(name: String!, email: String!, password: String!): AuthResponse!
    login(email: String!, password: String!): AuthResponse!
  }
`;
