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
      { userId, products, status }: { userId: string; products: { productId: string, quantity: number }[]; status: string }
    ) => {
      try {
        const orderId = uuidv4();

        const orderItem = {
          orderId,
          userId,
          status,
          products: products.map(p => ({ productId: p.productId, quantity: p.quantity })),
        };

        const transactItems = [
          {
            Put: {
              TableName: 'Orders',
              Item: DynamoDB.Converter.marshall(orderItem),
            },
          },
          ...products.map((product) => ({
            Update: {
              TableName: 'Products',
              Key: DynamoDB.Converter.marshall({ productId: product.productId }),
              UpdateExpression: 'SET #quantity = #quantity - :quantity',
              ExpressionAttributeNames: { '#quantity': 'quantity' },
              ExpressionAttributeValues: DynamoDB.Converter.marshall({ ':quantity': product.quantity }),
            },
          }))
        ];

        await dynamodb.transactWriteItems({ TransactItems: transactItems }).promise();

        return {
          success: true,
          message: 'Order created successfully',
          data: orderItem,
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
    products: async (order: { products: any[]; }) => {
      try {
        const productPromises = order.products.map(async (product: any) => {
          const params = {
            TableName: 'Products',
            Key: DynamoDB.Converter.marshall({ productId: product.productId }),
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
