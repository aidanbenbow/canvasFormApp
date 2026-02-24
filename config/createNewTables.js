// createNewTables.js
// Script to create new DynamoDB tables for domain-partitioned architecture
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });

async function createTable(params) {
  try {
    await client.send(new CreateTableCommand(params));
    console.log(`Created table: ${params.TableName}`);
  } catch (err) {
    if (err.name === 'ResourceInUseException') {
      console.log(`Table already exists: ${params.TableName}`);
    } else {
      console.error(`Error creating table ${params.TableName}:`, err);
    }
  }
}

async function main() {
  await createTable({
    TableName: 'users_table',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }
    ]
  });

  await createTable({
    TableName: 'forms_table',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'formId', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'formId', KeyType: 'HASH' }
    ]
  });

  await createTable({
    TableName: 'form_results_table',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'formId', AttributeType: 'S' },
      { AttributeName: 'resultId', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'formId', KeyType: 'HASH' },
      { AttributeName: 'resultId', KeyType: 'RANGE' }
    ]
  });

  await createTable({
    TableName: 'articles_table',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'articleId', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'articleId', KeyType: 'HASH' }
    ]
  });

  await createTable({
    TableName: 'progress_reports_table',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'reportId', AttributeType: 'S' }
    ],
    KeySchema: [
      { AttributeName: 'reportId', KeyType: 'HASH' }
    ]
  });
}

main();
