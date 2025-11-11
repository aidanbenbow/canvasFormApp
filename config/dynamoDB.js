import { DescribeTableCommand, DynamoDBClient,  } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
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
    async saveMessage(formId, inputs = []) {
      try {
        const timestamp = Date.now()
    
        const payload = {
          id: 'msg-' + timestamp,
         formId,
          inputs,
          timestamp
        };
    
        const params = {
          TableName: 'faithandbelief',
          Item: payload
        };
    
        const result = await this.docClient.send(new PutCommand(params));
        console.log('Form saved:', result);
        return result;
      } catch (error) {
        console.error('Error saving form:', error);
        throw new Error('Could not save form');
      }
    }
  
    async getFormData(user) {
      try {
        const params = {
          TableName: 'faithandbelief',
          ProjectionExpression: '#id, #label, #formStructure, #resultsTable, #inputs',
          ExpressionAttributeNames: {
            '#id': 'id',
            '#label': 'label',
            '#formStructure': 'formStructure',
            '#resultsTable': 'resultsTable',
            '#inputs': 'inputs'
          }
        };
    
        const data = await this.docClient.send(new ScanCommand(params));
        const allForms = data.Items || [];
    
        // ✅ Filter by user inside inputs
        const userForms = allForms.filter(item => item.inputs?.user === user);
    
        return userForms;
      } catch (error) {
        console.error("Error fetching form data:", error);
        throw new Error("Could not fetch form data");
      }
    }
async getFormDataById(id) {
        try {
            const params = {
                TableName: 'formStructures',
                Key: { id },
            };
            const data = await this.docClient.send(new GetCommand(params));
            console.log("Fetched form data by ID:", data.Item);
            return data.Item || null;
        } catch (error) {
            console.error("Error fetching form data by ID:", error);
            throw new Error("Could not fetch form data by ID");
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
    
      async upsertFormData(id, formStructure, label = 'Untitled', user = 'admin') {
        try {
          const item = {
            id,
            label,
            user,
            formStructure,
            lastModified: new Date().toISOString()
          };
      
          const params = {
            TableName: 'formStructures',
            Item: item
          };
      console.log('Upserting form data with params:', params);
          const result = await this.docClient.send(new PutCommand(params));
          console.log('Form upserted:', result);
          return result;
        } catch (error) {
          console.error('Error upserting form data:', error);
          throw new Error('Could not save form data');
        }
      }
      

      async fetchStudentCount() {
        try {
          const params = {
            TableName: 'cscstudents',
            Select: 'COUNT'
          };
    
          const data = await this.docClient.send(new ScanCommand(params));
          return data.Count || 0;
        } catch (error) {
          console.error("Error fetching student count:", error);
          return 0;
        }
      }

      async getFormResults(formId, tableName = 'cscstudents') {
      try{const params = {
        TableName: tableName,
        Key: {id: formId },
      };
      const data = await this.docClient.send(new GetCommand(params));
      console.log("Fetched form results:", data.Item);
      return data.Item ? [data.Item] : [];
    } catch (error) {
        console.error("Error fetching form results:", error);
        throw new Error("Could not fetch form results");

      }
      }
    
    
}

export default new DynamoDB();