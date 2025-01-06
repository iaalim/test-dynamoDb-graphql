import { gql } from 'apollo-server';

export const orderTypeDefs = gql`
  type Order {
    orderId: String!
    userId: String!
    products: [Product]!
    status: String!
  }

  type Product {
    productId: String!
    quantity: Float!
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
    getOrdersByUserId(userId: String!): OrderResponseList!
  }

  type Mutation {
    createOrder(userId: String!, products: [ProductInput!]!, status: String!): OrderResponse!
    updateOrderStatus(orderId: String!, status: String!): OrderResponse!
    deleteOrder(orderId: String!): OrderResponse!
  }

  input ProductInput {
    productId: String!
    quantity: Float!
  }
`;
