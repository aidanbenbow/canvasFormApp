// migrateArticles.js
// Script to migrate articles from old table to articles_table
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-central-1' });
const docClient = DynamoDBDocumentClient.from(client);

const OLD_ARTICLES_TABLE = 'dorcasusers'; // Change if your old table is named differently
const NEW_ARTICLES_TABLE = 'articles_table';

async function migrateArticles() {
  try {
    // Scan all articles from old table
    const scanResult = await docClient.send(new ScanCommand({ TableName: OLD_ARTICLES_TABLE }));
    const articles = scanResult.Items || [];
    console.log(`Found ${articles.length} articles to migrate.`);

    for (const article of articles) {
      // Standard migration: copy all fields, set articleId if missing
      const articleId = article.articleId || article.userId || article.id;
      if (!articleId) {
        console.warn('Skipping article with no articleId:', article);
        continue;
      }
      const newArticle = { ...article, articleId };
      await docClient.send(new PutCommand({ TableName: NEW_ARTICLES_TABLE, Item: newArticle }));
      console.log(`Migrated article: ${articleId}`);
    }
    console.log('Article migration complete.');
  } catch (err) {
    console.error('Error migrating articles:', err);
  }
}

migrateArticles();
