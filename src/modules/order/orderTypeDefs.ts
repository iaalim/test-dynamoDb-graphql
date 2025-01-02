import { gql } from 'apollo-server';

export const orderTypeDefs = gql`
  type Order {
    orderId: String!
    userId: String!
    productIds: [String!]!
    user: User
    products: [Product]
    status: String!
  }

  type OrderResponse {
    success: Boolean!
    message: String!
    data: Order
  }

  type OrderResponseList {
    success: Boolean!
    message: String!
    data: [Order]
  }

  type Query {
    getOrderById(orderId: String!): OrderResponse!
    listOrders: OrderResponseList!
  }

  type Mutation {
    createOrder(userId: String!, productIds: [String!]!, status: String!): OrderResponse!
    updateOrderStatus(orderId: String!, status: String!): OrderResponse!
    deleteOrder(orderId: String!): OrderResponse!
  }
`;
