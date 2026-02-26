// db/formDB.js
import { docClient } from "./dynamoClient.js";
import {
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  GetCommand,
  ScanCommand
} from "@aws-sdk/lib-dynamodb";

// Utility for default table naming
function buildDefaultResultsTableName(formId) {
  return `results_${formId}`;
}

// -----------------------------
// UPSERT FORM
// -----------------------------
export async function upsertFormData(formId, formStructure, label = "Untitled", user = "admin", resultsTable = null) {
  const existing = await docClient.send(
    new GetCommand({
      TableName: "forms_table",
      Key: { formId }
    })
  );

  const current = existing?.Item || null;

  const normalizedProvidedTable =
    typeof resultsTable === "string" && resultsTable.trim()
      ? resultsTable.trim()
      : null;

  const normalizedResultsTable =
    current?.resultsTable ||
    normalizedProvidedTable ||
    buildDefaultResultsTableName(formId);

  const item = {
    formId,
    label,
    user,
    resultsTable: normalizedResultsTable,
    formStructure,
    lastModified: new Date().toISOString()
  };

  await docClient.send(
    new PutCommand({
      TableName: "forms_table",
      Item: item
    })
  );

  return item;
}

// -----------------------------
// UPDATE FORM
// -----------------------------
export async function updateFormData(formId, formStructure, label = "Untitled", resultsTable = null) {
  const existing = await docClient.send(
    new GetCommand({
      TableName: "forms_table",
      Key: { formId }
    })
  );

  const current = existing?.Item || null;

  const normalizedProvidedTable =
    typeof resultsTable === "string" && resultsTable.trim()
      ? resultsTable.trim()
      : null;

  const normalizedResultsTable =
    current?.resultsTable ||
    normalizedProvidedTable ||
    buildDefaultResultsTableName(formId);

  const params = {
    TableName: "forms_table",
    Key: { formId },
    UpdateExpression:
      "SET #formStructure = :formStructure, #label = :label, #resultsTable = :resultsTable",
    ExpressionAttributeNames: {
      "#formStructure": "formStructure",
      "#label": "label",
      "#resultsTable": "resultsTable"
    },
    ExpressionAttributeValues: {
      ":formStructure": formStructure,
      ":label": label,
      ":resultsTable": normalizedResultsTable
    },
    ReturnValues: "UPDATED_NEW"
  };

  const result = await docClient.send(new UpdateCommand(params));
  return result.Attributes;
}

// -----------------------------
// DELETE FORM
// -----------------------------
export async function deleteFormData(formId) {
  const params = {
    TableName: "forms_table",
    Key: { formId }
  };

  await docClient.send(new DeleteCommand(params));
  return { deleted: true };
}

// -----------------------------
// FETCH ONE FORM
// -----------------------------
export async function getFormDataById(formId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: "forms_table",
      Key: { formId }
    })
  );

  return result.Item || null;
}

// -----------------------------
// FETCH ALL FORMS
// -----------------------------
export async function fetchAllForms() {
  const result = await docClient.send(
    new ScanCommand({
      TableName: "forms_table"
    })
  );

  return result.Items || [];
}