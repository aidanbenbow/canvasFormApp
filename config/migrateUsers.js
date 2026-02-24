// migrateUsers.js
// Script to migrate users from old table to users_table
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(client);

const OLD_USERS_TABLE = 'users'; // Change if your old table is named differently
const NEW_USERS_TABLE = 'users_table';

async function migrateUsers() {
  try {
    // Scan all users from old table
    const scanResult = await docClient.send(new ScanCommand({ TableName: OLD_USERS_TABLE }));
    const users = scanResult.Items || [];
    console.log(`Found ${users.length} users to migrate.`);

    for (const user of users) {
      // Standard migration: copy all fields, set userId if missing
      const userId = user.userId || user.id || user.username;
      if (!userId) {
        console.warn('Skipping user with no userId:', user);
        continue;
      }
      const newUser = { ...user, userId };
      await docClient.send(new PutCommand({ TableName: NEW_USERS_TABLE, Item: newUser }));
      console.log(`Migrated user: ${userId}`);
    }
    console.log('User migration complete.');
  } catch (err) {
    console.error('Error migrating users:', err);
  }
}

migrateUsers();
