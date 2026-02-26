// db/formResultsDB.js
import { docClient } from "./dynamoClient.js";
import {
  PutCommand,
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