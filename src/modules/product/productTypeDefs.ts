import { gql } from 'apollo-server';

export const productTypeDefs = gql`
  type Product {
    productId: String!
    name: String!
    price: Float!
    category: String!
  }

  type Query {
    getProductById(productId: String!): Product
    listProducts: [Product!]!
  }

  type Mutation {
    createProduct(name: String!, price: Float!, category: String!): Product
    updateProduct(productId: String!, name: String!, price: Float!, category: String!): Product
    deleteProduct(productId: String!): Boolean
  }
`;
