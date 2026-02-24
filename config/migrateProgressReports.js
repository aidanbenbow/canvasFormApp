// migrateProgressReports.js
// Script to migrate progress reports from old table to progress_reports_table
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(client);

const OLD_PROGRESS_TABLE = 'progressreports'; // Change if your old table is named differently
const NEW_PROGRESS_TABLE = 'progress_reports_table';

async function migrateProgressReports() {
  try {
    // Scan all progress reports from old table
    const scanResult = await docClient.send(new ScanCommand({ TableName: OLD_PROGRESS_TABLE }));
    const reports = scanResult.Items || [];
    console.log(`Found ${reports.length} progress reports to migrate.`);

    for (const report of reports) {
      // Standard migration: copy all fields, set reportId if missing
      const reportId = report.reportId || report.id;
      if (!reportId) {
        console.warn('Skipping report with no reportId:', report);
        continue;
      }
      const newReport = { ...report, reportId };
      await docClient.send(new PutCommand({ TableName: NEW_PROGRESS_TABLE, Item: newReport }));
      console.log(`Migrated progress report: ${reportId}`);
    }
    console.log('Progress reports migration complete.');
  } catch (err) {
    console.error('Error migrating progress reports:', err);
  }
}

migrateProgressReports();
