import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
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
    async saveMessage(id, message, label = 'Untitled') {
      try {
        const params = {
          TableName: 'testdata',
          Item: {
            id,
            message,
            label,
            timestamp: Date.now()
          }
        };
  
        const result = await this.docClient.send(new PutCommand(params));
        console.log('Message saved to testdata:', result);
        return result;
      } catch (error) {
        console.error('Error saving message to testdata:', error);
        throw new Error('Could not save message');
      }
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
    async updateFormData(id, formStructure, label = 'Untitled') {
        try {
          const params = {
            TableName: 'formStructures',
            Key: { id },
            UpdateExpression: 'SET #formStructure = :formStructure, #label = :label',
            ExpressionAttributeNames: {
              '#formStructure': 'formStructure',
              '#label': 'label',
            },
            ExpressionAttributeValues: {
              ':formStructure': formStructure,
              ':label': label,
            },
            ReturnValues: 'UPDATED_NEW',
          };
    
          const result = await this.docClient.send(new UpdateCommand(params));
          console.log('Form updated:', result);
          return result;
        } catch (error) {
          console.error('Error updating form data:', error);
          throw new Error('Could not update form data');
        }
      }
    
    
    
}

export default new DynamoDB();