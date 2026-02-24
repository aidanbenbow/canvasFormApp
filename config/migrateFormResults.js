// migrateFormResults.js
// Script to migrate form results from old tables to form_results_table
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(client);

const OLD_RESULTS_TABLES = [
  // Add all your old results table names here
  'form_results_form-1771840213207', // Example: generic results table
  // Add more if you have per-form tables, e.g. 'form_results_form-123', etc.
];
const NEW_RESULTS_TABLE = 'form_results_table';

async function migrateResultsFromTable(oldTable) {
  const scanResult = await docClient.send(new ScanCommand({ TableName: oldTable }));
  const results = scanResult.Items || [];
  console.log(`Found ${results.length} results in ${oldTable}.`);

  for (const result of results) {
    const formId = result.formId;
    const resultId = result.resultId || result.id || result.timestamp || `result-${Date.now()}`;
    if (!formId || !resultId) {
      console.warn('Skipping result with missing formId or resultId:', result);
      continue;
    }
    const newResult = { ...result, formId, resultId };
    await docClient.send(new PutCommand({ TableName: NEW_RESULTS_TABLE, Item: newResult }));
    console.log(`Migrated result: formId=${formId}, resultId=${resultId}`);
  }
}

async function main() {
  for (const oldTable of OLD_RESULTS_TABLES) {
    await migrateResultsFromTable(oldTable);
  }
  console.log('Form results migration complete.');
}

main();
