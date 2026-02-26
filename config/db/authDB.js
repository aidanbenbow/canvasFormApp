// db/authDB.js
import { docClient } from "./dynamoClient.js";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

// Save a session token
export async function saveSession(token, username) {
  const item = {
    token,
    username,
    createdAt: Date.now()
  };

  await docClient.send(
    new PutCommand({
      TableName: "sessions_table",
      Item: item
    })
  );

  return item;
}

// Fetch a session by token
export async function getSession(token) {
  const result = await docClient.send(
    new GetCommand({
      TableName: "sessions_table",
      Key: { token }
    })
  );

  return result.Item || null;
}