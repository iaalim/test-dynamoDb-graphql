import { DynamoDB } from 'aws-sdk';

const dynamoDB = new DynamoDB({
  region: 'us-west-2',
  accessKeyId: 'id',
  secretAccessKey: 'secretAccessKey',
  endpoint: 'http://localhost:8000',
});

export default dynamoDB;
