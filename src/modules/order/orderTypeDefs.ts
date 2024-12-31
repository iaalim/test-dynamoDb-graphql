import { gql } from 'apollo-server';

export const orderTypeDefs = gql`
  type Order {
    orderId: String!
    userId: String!
    productIds: [String!]!
    status: String!
  }

  type Query {
    getOrderById(orderId: String!): Order
    listOrders: [Order!]!
  }

  type Mutation {
    createOrder(userId: String!, productIds: [String!]!, status: String!): Order
    updateOrderStatus(orderId: String!, status: String!): Order
    deleteOrder(orderId: String!): Boolean
  }
`;
