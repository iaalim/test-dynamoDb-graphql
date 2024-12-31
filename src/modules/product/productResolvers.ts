import { DynamoDB } from 'aws-sdk';
import dynamodb from '../../config/dynamodbClient';
import { v4 as uuidv4 } from 'uuid';

export const productResolvers = {
  Query: {
    getProductById: async (_: any, { productId }: { productId: string }) => {
      const params = { TableName: 'Products', Key: { productId: { S: productId } } };
      const result = await dynamodb.getItem(params).promise();
      if (!result.Item) throw new Error('Product not found');
      return DynamoDB.Converter.unmarshall(result.Item);
    },
    listProducts: async () => {
      const params = { TableName: 'Products' };
      const result = await dynamodb.scan(params).promise();
      return result.Items?.map(item => DynamoDB.Converter.unmarshall(item)) || [];
    },
  },
  Mutation: {
    createProduct: async (_: any, { name, price, category }: any) => {
      const productId = uuidv4();
      const params = {
        TableName: 'Products',
        Item: { productId: { S: productId }, name: { S: name }, price: { N: price.toString() }, category: { S: category } },
      };
      await dynamodb.putItem(params).promise();
      return { productId, name, price, category };
    },
    updateProduct: async (_: any, { productId, name, price, category }: any) => {
      const params = {
        TableName: 'Products',
        Key: { productId: { S: productId } },
        UpdateExpression: 'SET name = :name, price = :price, category = :category',
        ExpressionAttributeValues: { ':name': { S: name }, ':price': { N: price.toString() }, ':category': { S: category } },
        ReturnValues: 'ALL_NEW',
      };
      const result = await dynamodb.updateItem(params).promise();
      return DynamoDB.Converter.unmarshall(result.Attributes!);
    },
    deleteProduct: async (_: any, { productId }: { productId: string }) => {
      const params = { TableName: 'Products', Key: { productId: { S: productId } } };
      await dynamodb.deleteItem(params).promise();
      return true;
    },
  },
};
