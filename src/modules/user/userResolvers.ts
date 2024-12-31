import { DynamoDB } from 'aws-sdk';
import dynamodb from '../../config/dynamodbClient';
import { v4 as uuidv4 } from 'uuid';

export const userResolvers = {
  Query: {
    getUserById: async (_: any, { id }: { id: string }) => {
      const params = { TableName: 'Users', Key: { id: { S: id } } };
      const result = await dynamodb.getItem(params).promise();
      if (!result.Item) throw new Error('User not found');
      return DynamoDB.Converter.unmarshall(result.Item);
    },
    getUserByEmail: async (_: any, { email }: { email: string }) => {
      const params = {
        TableName: 'Users',
        IndexName: 'emailIndex',
        KeyConditionExpression: 'email = :email',
        ExpressionAttributeValues: { ':email': { S: email } },
      };
      const result = await dynamodb.query(params).promise();
      if (!result.Items || result.Items.length === 0) throw new Error('User not found');
      return DynamoDB.Converter.unmarshall(result.Items[0]);
    },
    listUsers: async () => {
      const params = { TableName: 'Users' };
      const result = await dynamodb.scan(params).promise();
      return result.Items?.map(item => DynamoDB.Converter.unmarshall(item)) || [];
    },
  },
  Mutation: {
    createUser: async (_: any, { name, email }: { name: string; email: string }) => {
      const id = uuidv4();
      const params = {
        TableName: 'Users',
        Item: { id: { S: id }, name: { S: name }, email: { S: email } },
      };
      await dynamodb.putItem(params).promise();
      return { id, name, email };
    },
    updateUser: async (_: any, { id, name, email }: { id: string; name: string; email: string }) => {
      const params = {
        TableName: 'Users',
        Key: { id: { S: id } },
        UpdateExpression: 'SET #name = :name, email = :email',
        ExpressionAttributeNames: { '#name': 'name' },
        ExpressionAttributeValues: { ':name': { S: name }, ':email': { S: email } },
        ReturnValues: 'ALL_NEW',
      };
      const result = await dynamodb.updateItem(params).promise();
      return DynamoDB.Converter.unmarshall(result.Attributes!);
    },
    deleteUser: async (_: any, { id }: { id: string }) => {
      const params = { TableName: 'Users', Key: { id: { S: id } } };
      await dynamodb.deleteItem(params).promise();
      return true;
    },
  },
};
