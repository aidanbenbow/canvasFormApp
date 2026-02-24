// migrateForms.js
// Script to migrate forms from old table to forms_table
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(client);

const OLD_FORMS_TABLE = 'formStructures'; // Change if your old table is named differently
const NEW_FORMS_TABLE = 'forms_table';

async function migrateForms() {
  try {
    // Scan all forms from old table
    const scanResult = await docClient.send(new ScanCommand({ TableName: OLD_FORMS_TABLE }));
    const forms = scanResult.Items || [];
    console.log(`Found ${forms.length} forms to migrate.`);

    for (const form of forms) {
      // Standard migration: copy all fields, set formId if missing
      const formId = form.formId || form.id;
      if (!formId) {
        console.warn('Skipping form with no formId:', form);
        continue;
      }
      const newForm = { ...form, formId };
      await docClient.send(new PutCommand({ TableName: NEW_FORMS_TABLE, Item: newForm }));
      console.log(`Migrated form: ${formId}`);
    }
    console.log('Form migration complete.');
  } catch (err) {
    console.error('Error migrating forms:', err);
  }
}

migrateForms();
