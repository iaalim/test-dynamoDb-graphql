import { DynamoDB } from 'aws-sdk';
import dynamodb from '../../config/dynamodbClient';
import { v4 as uuidv4 } from 'uuid';

export const productResolvers = {
  Query: {
    getProductById: async (_: any, { productId }: { productId: string }) => {
      try {
        const params = {
          TableName: 'Products',
          Key: DynamoDB.Converter.marshall({ productId }),
        };

        const result = await dynamodb.getItem(params).promise();
        if (!result.Item) {
          return { success: false, message: 'Product not found', data: null };
        }

        return {
          success: true,
          message: 'Product retrieved successfully',
          data: DynamoDB.Converter.unmarshall(result.Item),
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    },

    listProducts: async () => {
      try {
        const params = { TableName: 'Products' };

        const result = await dynamodb.scan(params).promise();
        const products =
          result.Items?.map((item) => DynamoDB.Converter.unmarshall(item)) || [];

        return {
          success: true,
          message: 'Products retrieved successfully',
          data: products,
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    },
  },

  Mutation: {
    createProduct: async (
      _: any,
      { name, price, category, quantity }: { name: string; price: number; category: string; quantity: number }
    ) => {
      try {
        const productId = uuidv4();
        const item = DynamoDB.Converter.marshall({
          productId,
          name,
          price,
          category,
          quantity,
        });

        const params = {
          TableName: 'Products',
          Item: item,
        };

        await dynamodb.putItem(params).promise();

        return {
          success: true,
          message: 'Product created successfully',
          data: { productId, name, price, category, quantity },
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    },

    updateProduct: async (
      _: any,
      {
        productId,
        name,
        price,
        category,
        quantity,
      }: { productId: string; name: string; price: number; category: string; quantity: number }
    ) => {
      try {
        const params = {
          TableName: 'Products',
          Key: DynamoDB.Converter.marshall({ productId }),
          UpdateExpression: 'SET name = :name, price = :price, category = :category, quantity = :quantity',
          ExpressionAttributeValues: DynamoDB.Converter.marshall({
            ':name': name,
            ':price': price,
            ':category': category,
            ':quantity': quantity,
          }),
          ReturnValues: 'ALL_NEW',
        };

        const result = await dynamodb.updateItem(params).promise();
        if (!result.Attributes) {
          return { success: false, message: 'Error updating product', data: null };
        }

        return {
          success: true,
          message: 'Product updated successfully',
          data: DynamoDB.Converter.unmarshall(result.Attributes),
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    },

    deleteProduct: async (_: any, { productId }: { productId: string }) => {
      try {
        const params = {
          TableName: 'Products',
          Key: DynamoDB.Converter.marshall({ productId }),
        };

        await dynamodb.deleteItem(params).promise();

        return {
          success: true,
          message: 'Product deleted successfully',
          data: null,
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    },
  },
};
