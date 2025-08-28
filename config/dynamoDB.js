import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
dotenv.config();

class DynamoDB {
    constructor() {
        
        const client = new DynamoDBClient({
            region: process.env.AWS_REGION || "eu-central-1",
            // credentials: {
            //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            // },
        });

        this.docClient = DynamoDBDocumentClient.from(client);
        
    }
    async getFormData() {
        try {
            const params = {
                TableName: 'formStructures', // Replace with your table name
                ProjectionExpression: '#id, #label, #formStructure',
      ExpressionAttributeNames: {
        '#id': 'id',
        '#label': 'label',
        '#formStructure': 'formStructure'
      }

            };
            const data = await this.docClient.send(new ScanCommand(params));
     
            return data.Items || [];
        } catch (error) {
            console.error("Error fetching form data:", error);
            throw new Error("Could not fetch form data");
        }
    }
    
}

export default new DynamoDB();