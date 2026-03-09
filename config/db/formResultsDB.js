// db/formResultsDB.js
import { docClient } from "./dynamoClient.js";
import {
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";

// -----------------------------
// SAVE RESULT
// -----------------------------
export async function saveFormResult({ formId, userId, payload }) {
  const item = {
    formId,
    createdAt: Date.now(),
    userId,
    payload
  };

  await docClient.send(
    new PutCommand({
      TableName: "form_results_table",
      Item: item
    })
  );

  return item;
}

// -----------------------------
// FETCH RESULTS FOR ONE FORM
// -----------------------------
export async function getFormResults(formId) {
  if (!formId) return [];

  const params = {
    TableName: "form_results_table",
    KeyConditionExpression: "#formId = :id",
    ExpressionAttributeNames: { "#formId": "formId" },
    ExpressionAttributeValues: { ":id": formId }
  };

  const data = await docClient.send(new QueryCommand(params));
  return data.Items || [];
}

// -----------------------------
// FETCH ALL RESULTS (OPTIONAL TABLE)
// -----------------------------
export async function getAllFormResults(tableName = "form_results_table") {
  const params = { TableName: tableName };
  const data = await docClient.send(new ScanCommand(params));
  return data.Items || [];
}

// -----------------------------
// UPDATE RESULT
// -----------------------------
export async function updateFormResult({ formId, createdAt, payload }) {
  const normalizedFormId = String(formId || '').trim();
  const numericCreatedAt = Number(createdAt);

  if (!normalizedFormId) throw new Error('Missing formId');
  if (!Number.isFinite(numericCreatedAt)) throw new Error('Missing createdAt');

  const result = await docClient.send(
    new UpdateCommand({
      TableName: 'form_results_table',
      Key: {
        formId: normalizedFormId,
        createdAt: numericCreatedAt
      },
      UpdateExpression: 'SET #payload = :payload, #updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#payload': 'payload',
        '#updatedAt': 'updatedAt'
      },
      ExpressionAttributeValues: {
        ':payload': payload || {},
        ':updatedAt': Date.now()
      },
      ConditionExpression: 'attribute_exists(formId) AND attribute_exists(createdAt)',
      ReturnValues: 'ALL_NEW'
    })
  );

  return result.Attributes;
}