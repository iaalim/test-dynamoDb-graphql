import { authMiddleware } from '../auth/authMiddleware';
import { DynamoDB } from 'aws-sdk';
import dynamodb from '../../config/dynamodbClient';

export const userResolvers = {
  Query: {
    getUserById: authMiddleware(async (_: any, { id }: { id: string }, context: any) => {
      try {
        console.log("-------",context.user.id)
        const params = { TableName: 'Users', Key: DynamoDB.Converter.marshall({ id }) };

        const result = await dynamodb.getItem(params).promise();
        if (!result.Item) {
          return { success: false, message: 'User not found', data: null };
        }

        return {
          success: true,
          message: 'User retrieved successfully',
          data: DynamoDB.Converter.unmarshall(result.Item),
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    }),

    getUserByEmail: authMiddleware(async (_: any, { email }: { email: string }, context: any) => {
      try {
        const params = {
          TableName: 'Users',
          IndexName: 'emailIndex',
          KeyConditionExpression: 'email = :email',
          ExpressionAttributeValues: DynamoDB.Converter.marshall({
            ':email': email,
          }),
        };

        const result = await dynamodb.query(params).promise();
        if (!result.Items || result.Items.length === 0) {
          return { success: false, message: 'User not found', data: null };
        }

        return {
          success: true,
          message: 'User retrieved successfully',
          data: DynamoDB.Converter.unmarshall(result.Items[0]),
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    }),

    listUsers: authMiddleware(async (_: any, __: any, context: any) => {
      try {
        const params = { TableName: 'Users' };

        const result = await dynamodb.scan(params).promise();
        const users =
          result.Items?.map((item) => DynamoDB.Converter.unmarshall(item)) || [];

        return {
          success: true,
          message: 'Users retrieved successfully',
          data: users,
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    }),
  },

  Mutation: {
    updateUser: authMiddleware(async (_: any, { id, name, email }: any, context: any) => {
      try {
        const params = {
          TableName: 'Users',
          Key: DynamoDB.Converter.marshall({ id }),
          UpdateExpression: 'SET #name = :name, email = :email',
          ExpressionAttributeNames: {
            '#name': 'name',
          },
          ExpressionAttributeValues: DynamoDB.Converter.marshall({
            ':name': name,
            ':email': email,
          }),
          ReturnValues: 'ALL_NEW',
        };

        const result = await dynamodb.updateItem(params).promise();

        if (!result.Attributes) {
          return { success: false, message: 'Error updating user', data: null };
        }

        return {
          success: true,
          message: 'User updated successfully',
          data: DynamoDB.Converter.unmarshall(result.Attributes),
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    }),

    deleteUser: authMiddleware(async (_: any, { id }: { id: string }, context: any) => {
      try {
        const params = {
          TableName: 'Users',
          Key: DynamoDB.Converter.marshall({ id }),
        };

        await dynamodb.deleteItem(params).promise();

        return {
          success: true,
          message: 'User deleted successfully',
          data: null,
        };
      } catch (error) {
        return { success: false, message: error, data: null };
      }
    }),
  },
};
