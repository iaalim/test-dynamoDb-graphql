import { gql } from 'apollo-server';

export const productTypeDefs = gql`
  type Product {
    productId: String!
    name: String!
    price: Float!
    category: String!
    quantity: Float!
  }

  type ProductResponse {
    success: Boolean!
    message: String!
    data: Product
  }

  type ProductResponseList {
    success: Boolean!
    message: String!
    data: [Product]
    nextToken: String
  }

  type Query {
    getProductById(productId: String!): ProductResponse!
    listProducts(limit: Int, nextToken: String): ProductResponseList!
  }

  type Mutation {
    createProduct(name: String!, price: Float!, category: String!, quantity: Float!): ProductResponse!
    updateProduct(productId: String!, name: String!, price: Float!, category: String!): ProductResponse!
    deleteProduct(productId: String!): ProductResponse!
  }
`;
