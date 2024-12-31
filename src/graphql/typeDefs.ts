import { gql } from 'apollo-server';
import { userTypeDefs } from '../modules/user/userTypeDefs';
import { orderTypeDefs } from '../modules/order/orderTypeDefs';
import { productTypeDefs } from '../modules/product/productTypeDefs';

export const typeDefs = gql`
  ${userTypeDefs}
  ${orderTypeDefs}
  ${productTypeDefs}
`;
