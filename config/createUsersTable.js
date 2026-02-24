import { CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import db from "./dynamoDB.js";

async function createUsersTable() {
  const client = db.client;
  const tableName = "users";
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log("Table already exists:", tableName);
  } catch (e) {
    if (e.name === "ResourceNotFoundException") {
      await client.send(new CreateTableCommand({
        TableName: tableName,
        AttributeDefinitions: [
          { AttributeName: "username", AttributeType: "S" }
        ],
        KeySchema: [
          { AttributeName: "username", KeyType: "HASH" }
        ],
        BillingMode: "PAY_PER_REQUEST"
      }));
      console.log("Created table:", tableName);
    } else {
      throw e;
    }
  }
}

createUsersTable();
