import { userResolvers } from '../modules/user/userResolvers';
import { orderResolvers } from '../modules/order/orderResolvers';
import { productResolvers } from '../modules/product/productResolvers';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...orderResolvers.Query,
    ...productResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...productResolvers.Mutation,
  },
};
