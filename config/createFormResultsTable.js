import { CreateTableCommand, UpdateContinuousBackupsCommand } from "@aws-sdk/client-dynamodb";
import db from "./dynamoDB.js";

async function createFormResultsTable() {
  const client = db.client;
  const tableName = "form_results_table";
  try {
    await client.send(new CreateTableCommand({
      TableName: tableName,
      AttributeDefinitions: [
        { AttributeName: "formId", AttributeType: "S" },
        { AttributeName: "createdAt", AttributeType: "N" },
        { AttributeName: "userId", AttributeType: "S" }
      ],
      KeySchema: [
        { AttributeName: "formId", KeyType: "HASH" },
        { AttributeName: "createdAt", KeyType: "RANGE" }
      ],
      BillingMode: "PAY_PER_REQUEST",
      GlobalSecondaryIndexes: [
        {
          IndexName: "GSI1",
          KeySchema: [
            { AttributeName: "userId", KeyType: "HASH" },
            { AttributeName: "createdAt", KeyType: "RANGE" }
          ],
          Projection: { ProjectionType: "ALL" }
        }
      ]
    }));
    console.log("Created table:", tableName);

    // Enable Point-In-Time Recovery (PITR)
    await client.send(new UpdateContinuousBackupsCommand({
      TableName: tableName,
      PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true }
    }));
    console.log("PITR enabled for:", tableName);

  } catch (e) {
    if (e.name === "ResourceInUseException") {
      console.log("Table already exists:", tableName);
    } else {
      throw e;
    }
  }
}

createFormResultsTable();