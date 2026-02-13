import { DescribeTableCommand, DynamoDBClient,  } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand, QueryCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
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
    async saveMessage(formId,user, inputs = []) {
      try {
        const timestamp = Date.now()
    
        const payload = {
          id: 'msg-' + timestamp,
         formId,
         user,
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
          TableName: 'formStructures',
          ProjectionExpression: '#id, #label, #formStructure, #resultsTable, #inputs, #user', 
          ExpressionAttributeNames: {
            '#id': 'id',
            '#label': 'label',
            '#formStructure': 'formStructure',
            '#resultsTable': 'resultsTable',
            '#inputs': 'inputs',
             '#user': 'user'
          }
        };
    
        const data = await this.docClient.send(new ScanCommand(params));
        
        const allForms = data.Items || [];
    
        // ✅ Filter by user inside inputs
        const userForms = allForms.filter(form => form.user === user);
    
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
            
            return data.Item || null;
        } catch (error) {
            console.error("Error fetching form data by ID:", error);
            throw new Error("Could not fetch form data by ID");
        }
    }

    async getArticleById(userId) {
        try {
            const params = {
                TableName: 'dorcasusers',
                Key: { userId },
            };
            const data = await this.docClient.send(new GetCommand(params));
            
            return data.Item || null;
        }
        catch (error) {
            console.error("Error fetching article by ID:", error);
            throw new Error("Could not fetch article by ID");
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
    
async deleteFormData(id) {
        try {
          const params = {
            TableName: 'formStructures',
            Key: { id },
          };
    console.log('Deleting form data with params:', params)
          const result = await this.docClient.send(new DeleteCommand(params));
          console.log('Form deleted:', result);
          return result;
        } catch (error) {
          console.error('Error deleting form data:', error);
          throw new Error('Could not delete form data');
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
        try {
          if (tableName === 'progressreports') {
            // progressreports table does not store formId; return all items
            return await this.getAllFormResults(tableName);
          }

          const params = {
            TableName: tableName,
            FilterExpression: '#formId = :formIdVal',
            ExpressionAttributeNames: {
              '#formId': 'formId'
            },
            ExpressionAttributeValues: {
              ':formIdVal': formId
            }
          };
      
          const data = await this.docClient.send(new ScanCommand(params));
          const items = data.Items || [];

          if (items.length === 0) {
            const fallback = await this.getAllFormResults(tableName);
            return fallback;
          }

          return items;
        } catch (error) {
          console.error("Error fetching form results:", error);
          throw new Error("Could not fetch form results");
        }

    
      }

      async updateProgressReport(reportId, updates = {}) {
        if (!reportId) {
          throw new Error("Missing reportId for progressreports update");
        }

        const cleaned = Object.entries(updates)
          .filter(([, value]) => value !== null && value !== undefined)
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});

        if (Object.keys(cleaned).length === 0) {
          throw new Error("No update fields provided for progressreports");
        }

        const lookup = await this.docClient.send(new QueryCommand({
          TableName: 'progressreports',
          KeyConditionExpression: '#id = :idVal',
          ExpressionAttributeNames: {
            '#id': 'id'
          },
          ExpressionAttributeValues: {
            ':idVal': reportId
          },
          ScanIndexForward: false,
          Limit: 1
        }));

        const item = lookup.Items?.[0];
        if (!item) {
          throw new Error(`No progressreports item found for id ${reportId}`);
        }

        const updateKeys = Object.keys(cleaned);
        const updateExpr = updateKeys.map((key, index) => `#f${index} = :v${index}`).join(', ');
        const names = updateKeys.reduce((acc, key, index) => {
          acc[`#f${index}`] = key;
          return acc;
        }, {});
        const values = updateKeys.reduce((acc, key, index) => {
          acc[`:v${index}`] = cleaned[key];
          return acc;
        }, {});

        const params = {
          TableName: 'progressreports',
          Key: { id: item.id, createdAt: item.createdAt },
          UpdateExpression: `SET ${updateExpr}`,
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: values,
          ReturnValues: 'ALL_NEW'
        };

        const result = await this.docClient.send(new UpdateCommand(params));
        return result.Attributes || result;
      }
      
    async getAllFormResults(tableName = 'cscstudents') {
        try {
          const params = {
            TableName: tableName,
          };
    
          const data = await this.docClient.send(new ScanCommand(params));
          return data.Items || [];
        } catch (error) {
          console.error("Error fetching all form results:", error);
          throw new Error("Could not fetch all form results");
        }
      }
    
}

export default new DynamoDB();