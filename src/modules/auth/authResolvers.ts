import { hashPassword, verifyPassword, generateToken } from './authUtils';
import { DynamoDB } from 'aws-sdk';
import dynamodb from '../../config/dynamodbClient';
import { v4 as uuidv4 } from 'uuid';

export const authResolvers = {
  Mutation: {
    signup: async (_: any, { name, email, password }: { name: string; email: string; password: string }) => {
      try {
        // Check if user with the given email already exists
        const existingUserParams = {
          TableName: 'Users',
          IndexName: 'emailIndex',
          KeyConditionExpression: 'email = :email',
          ExpressionAttributeValues: DynamoDB.Converter.marshall({ ':email': email }),
        };

        const existingUserResult = await dynamodb.query(existingUserParams).promise();

        if (existingUserResult.Items && existingUserResult.Items.length > 0) {
          return {
            success: false,
            message: 'User already exists with this email',
            data: null,
          };
        }

        const hashedPassword = await hashPassword(password);
        const id = uuidv4();

        const item = DynamoDB.Converter.marshall({
          id,
          name,
          email,
          password: hashedPassword,
        });

        const params = {
          TableName: 'Users',
          Item: item,
        };

        await dynamodb.putItem(params).promise();

        const token = generateToken({ id, email });

        return {
          success: true,
          message: 'User registered successfully',
          data: { id, name, email, token },
        };
      } catch (error) {
        return { success: false, message: error || 'An error occurred', data: null };
      }
    },

    login: async (_: any, { email, password }: { email: string; password: string }) => {
      try {
        const params = {
          TableName: 'Users',
          IndexName: 'emailIndex',
          KeyConditionExpression: 'email = :email',
          ExpressionAttributeValues: DynamoDB.Converter.marshall({ ':email': email }),
        };

        const result = await dynamodb.query(params).promise();

        if (!result.Items || result.Items.length === 0) {
          return { success: false, message: 'User not found', data: null };
        }

        const user = DynamoDB.Converter.unmarshall(result.Items[0]);

        const isPasswordValid = await verifyPassword(password, user.password);

        if (!isPasswordValid) {
          return { success: false, message: 'Invalid password', data: null };
        }

        const token = generateToken({ id: user.id, email: user.email });

        return {
          success: true,
          message: 'Login successful',
          data: { id: user.id, name: user.name, email: user.email, token },
        };
      } catch (error) {
        return { success: false, message: error || 'An error occurred', data: null };
      }
    },
  },
};
