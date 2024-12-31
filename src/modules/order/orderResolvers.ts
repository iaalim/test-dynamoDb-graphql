import { DynamoDB } from 'aws-sdk';
import dynamodb from '../../config/dynamodbClient';
import { v4 as uuidv4 } from 'uuid';

export const orderResolvers = {
  Query: {
    getOrderById: async (_: any, { orderId }: { orderId: string }) => {
      const params = { TableName: 'Orders', Key: { orderId: { S: orderId } } };
      const result = await dynamodb.getItem(params).promise();
      if (!result.Item) throw new Error('Order not found');
      return DynamoDB.Converter.unmarshall(result.Item);
    },
    listOrders: async () => {
      const params = { TableName: 'Orders' };
      const result = await dynamodb.scan(params).promise();
      return result.Items?.map(item => DynamoDB.Converter.unmarshall(item)) || [];
    },
  },
  Mutation: {
    createOrder: async (_: any, { userId, productIds, status }: any) => {
      const orderId = uuidv4();
      const params = {
        TableName: 'Orders',
        Item: {
          orderId: { S: orderId },
          userId: { S: userId },
          productIds: { L: productIds.map((id: string) => ({ S: id })) },
          status: { S: status },
        },
      };
      await dynamodb.putItem(params).promise();
      return { orderId, userId, productIds, status };
    },
    updateOrderStatus: async (_: any, { orderId, status }: { orderId: string; status: string }) => {
      const params = {
        TableName: 'Orders',
        Key: { orderId: { S: orderId } },
        UpdateExpression: 'SET status = :status',
        ExpressionAttributeValues: { ':status': { S: status } },
        ReturnValues: 'ALL_NEW',
      };
      const result = await dynamodb.updateItem(params).promise();
      return DynamoDB.Converter.unmarshall(result.Attributes!);
    },
    deleteOrder: async (_: any, { orderId }: { orderId: string }) => {
      const params = { TableName: 'Orders', Key: { orderId: { S: orderId } } };
      await dynamodb.deleteItem(params).promise();
      return true;
    },
  },
};
