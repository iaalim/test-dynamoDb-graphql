import { DynamoDB } from 'aws-sdk';
import dynamodb from '../../config/dynamodbClient';
import { v4 as uuidv4 } from 'uuid';

export const orderResolvers = {
  Query: {
    getOrderById: async (_: any, { orderId }: { orderId: string }) => {
      try {
        const params = {
          TableName: 'Orders',
          Key: DynamoDB.Converter.marshall({ orderId }),
        };
        const result = await dynamodb.getItem(params).promise();

        if (!result.Item) {
          return { success: false, message: 'Order not found', data: null };
        }

        const order = DynamoDB.Converter.unmarshall(result.Item);

        return {
          success: true,
          message: 'Order retrieved successfully',
          data: order,
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    },

    listOrders: async () => {
      try {
        const params = { TableName: 'Orders' };
        const result = await dynamodb.scan(params).promise();

        const orders =
          result.Items?.map((item) => DynamoDB.Converter.unmarshall(item)) || [];

        return {
          success: true,
          message: 'Orders retrieved successfully',
          data: orders,
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    },
  },

  Mutation: {
    createOrder: async (
      _: any,
      { userId, productIds, status }: { userId: string; productIds: string[]; status: string }
    ) => {
      try {
        const orderId = uuidv4();
        const params = {
          TableName: 'Orders',
          Item: DynamoDB.Converter.marshall({
            orderId,
            userId,
            productIds,
            status,
          }),
        };

        await dynamodb.putItem(params).promise();

        return {
          success: true,
          message: 'Order created successfully',
          data: { orderId, userId, productIds, status },
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    },

    updateOrderStatus: async (
      _: any,
      { orderId, status }: { orderId: string; status: string }
    ) => {
      try {
        const params = {
          TableName: 'Orders',
          Key: DynamoDB.Converter.marshall({ orderId }),
          UpdateExpression: 'SET #status = :status',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: DynamoDB.Converter.marshall({ ':status': status }),
          ReturnValues: 'ALL_NEW',
        };

        const result = await dynamodb.updateItem(params).promise();

        if (!result.Attributes) {
          return { success: false, message: 'Order not found', data: null };
        }

        return {
          success: true,
          message: 'Order status updated successfully',
          data: DynamoDB.Converter.unmarshall(result.Attributes),
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    },

    deleteOrder: async (_: any, { orderId }: { orderId: string }) => {
      try {
        const params = {
          TableName: 'Orders',
          Key: DynamoDB.Converter.marshall({ orderId }),
        };

        await dynamodb.deleteItem(params).promise();

        return {
          success: true,
          message: 'Order deleted successfully',
          data: null,
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    },
  },

  Order: {
    user: async (order: { userId: any; }) => {
      try {
        const params = {
          TableName: 'Users',
          Key: DynamoDB.Converter.marshall({ id: order.userId }),
        };
        const result = await dynamodb.getItem(params).promise();
        return result.Item ? DynamoDB.Converter.unmarshall(result.Item) : null;
      } catch (error) {
        throw new Error('Error fetching user');
      }
    },
    products: async (order: { productIds: any[]; }) => {
      try {
        const productPromises = order.productIds.map(async (productId: any) => {
          const params = {
            TableName: 'Products',
            Key: DynamoDB.Converter.marshall({ productId }),
          };
          const result = await dynamodb.getItem(params).promise();
          return result.Item ? DynamoDB.Converter.unmarshall(result.Item) : null;
        });

        return await Promise.all(productPromises);
      } catch (error) {
        throw new Error('Error fetching products');
      }
    },
  },
};
