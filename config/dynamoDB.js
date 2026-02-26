
import { CreateTableCommand, DescribeTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand, QueryCommand, GetCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
dotenv.config();

class DynamoDB {
        async saveSession(token, username, expiresAt = null) {
          try {
            const params = {
              TableName: 'sessions_table',
              Item: {
                token,
                username,
                expiresAt: expiresAt || null
              }
            };
            await this.docClient.send(new PutCommand(params));
            return true;
          } catch (error) {
            console.error('Error saving session:', error);
            throw new Error('Could not save session');
          }
        }

        async getSession(token) {
          try {
            const params = {
              TableName: 'sessions_table',
              Key: { token }
            };
            const data = await this.docClient.send(new GetCommand(params));
            return data.Item || null;
          } catch (error) {
            console.error('Error fetching session:', error);
            throw new Error('Could not fetch session');
          }
        }
    constructor() {
        
        const client = new DynamoDBClient({
          region: process.env.AWS_REGION || "eu-central-1",
          // credentials: {
          //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          // },
        });

        this.client = client;
        this.docClient = DynamoDBDocumentClient.from(client);
    }
    // New: Save a form submission to form_results_table
    async saveFormResult({ formId, userId, payload }) {
      const item = {
        formId,
        createdAt: Date.now(),
        userId,
        payload
      };
      const params = {
        TableName: 'form_results_table',
        Item: item
      };
      await this.docClient.send(new PutCommand(params));
      return item;
    }
  
    async getFormData(user) {
      try {
        const params = {
          TableName: 'forms_table',
          ProjectionExpression: '#formId, #label, #formStructure, #resultsTable, #inputs, #user',
          ExpressionAttributeNames: {
            '#formId': 'formId',
            '#label': 'label',
            '#formStructure': 'formStructure',
            '#resultsTable': 'resultsTable',
            '#inputs': 'inputs',
            '#user': 'user'
          }
        };
        const data = await this.docClient.send(new ScanCommand(params));
        const allForms = data.Items || [];
        const userForms = allForms.filter(form => form.user === user);
        return userForms;
      } catch (error) {
        console.error("Error fetching form data:", error);
        throw new Error("Could not fetch form data");
      }
    }
    async getFormDataById(formId) {
      try {
        const params = {
          TableName: 'forms_table',
          Key: { formId },
        };
        const data = await this.docClient.send(new GetCommand(params));
        return data.Item || null;
      } catch (error) {
        console.error("Error fetching form data by ID:", error);
        throw new Error("Could not fetch form data by ID");
      }
    }

    async getArticleById(articleId) {
      try {
        const params = {
          TableName: 'articles_table',
          Key: { articleId },
        };
        const data = await this.docClient.send(new GetCommand(params));
        return data.Item || null;
      } catch (error) {
        console.error("Error fetching article by ID:", error);
        throw new Error("Could not fetch article by ID");
      }
    }


    async createArticle({
      articleId,
      title,
      content,
      excerpt,
      slug,
      status = "draft",
      createdBy,
      updatedBy,
      publishedAt,
      photo,
      ...rest
    }) {
      try {
        if (!articleId) {
          throw new Error("Missing articleId for articles_table");
        }

        const now = Date.now();

        // Force numeric timestamps
        const numericPublishedAt =
          status === "published"
            ? Number(publishedAt ?? now)
            : undefined;

        const item = {
          articleId,
          title,
          content,
          excerpt,
          slug: slug?.toLowerCase(),
          status,

          createdAt: now,
          updatedAt: now,

          createdBy,
          updatedBy,

          ...(numericPublishedAt && { publishedAt: numericPublishedAt }),
          ...(photo && { photo }),

          ...rest
        };

        const params = {
          TableName: "articles_table",
          Item: item
        };

        const result = await this.docClient.send(
          new PutCommand(params)
        );

        return { ...result, item };

      } catch (error) {
        console.error("Error creating article:", error);
        throw new Error("Could not create article");
      }
    }

    async updateArticle(articleId, updates = {}) {
  try {
    const normalizedArticleId = String(articleId || '').trim();
    if (!normalizedArticleId) {
      throw new Error("Missing articleId");
    }

    if (!updates || typeof updates !== "object") {
      throw new Error("Invalid updates payload");
    }

    const IMMUTABLE_FIELDS = new Set([
      "articleId",
      "createdAt",
      "createdBy"
    ]);

    const NUMERIC_FIELDS = new Set([
      "publishedAt",
      "updatedAt"
    ]);

    // Clone and normalize
    const safeUpdates = { ...updates };

    // System-managed timestamp
    safeUpdates.updatedAt = Date.now();

    // Remove immutable fields
    for (const field of IMMUTABLE_FIELDS) {
      delete safeUpdates[field];
    }

    // Normalize numeric GSI fields
    for (const field of NUMERIC_FIELDS) {
      if (field in safeUpdates) {
        const v = Number(safeUpdates[field]);
        if (Number.isFinite(v)) {
          safeUpdates[field] = v;
        } else {
          delete safeUpdates[field];
        }
      }
    }

    const setClauses = [];
    const removeClauses = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    let index = 0;

    for (const [key, value] of Object.entries(safeUpdates)) {
      if (value === undefined) continue;

      index++;

      const nameKey = `#f${index}`;
      expressionAttributeNames[nameKey] = key;

      if (value === null) {
        removeClauses.push(nameKey);
      } else {
        const valueKey = `:v${index}`;
        setClauses.push(`${nameKey} = ${valueKey}`);
        expressionAttributeValues[valueKey] = value;
      }
    }

    if (setClauses.length === 0 && removeClauses.length === 0) {
      throw new Error("No valid update fields");
    }

    let updateExpression = "";

    if (setClauses.length > 0) {
      updateExpression += "SET " + setClauses.join(", ");
    }

    if (removeClauses.length > 0) {
      if (updateExpression) updateExpression += " ";
      updateExpression += "REMOVE " + removeClauses.join(", ");
    }

    const params = {
      TableName: "articles_table",
      Key: { articleId: normalizedArticleId },

      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues:
        Object.keys(expressionAttributeValues).length > 0
          ? expressionAttributeValues
          : undefined,

      ConditionExpression: "attribute_exists(articleId)",
      ReturnValues: "ALL_NEW"
    };

    const result = await this.docClient.send(
      new UpdateCommand(params)
    );

    return result.Attributes;

  } catch (error) {
    console.error("Error updating article:", error);
    throw new Error("Could not update article");
  }
}


    async updateFormData(formId, formStructure, label = 'Untitled', resultsTable = null) {
      try {
        const currentForm = await this.docClient.send(
          new GetCommand({
            TableName: 'forms_table',
            Key: { formId }
          })
        );
        const normalizedProvidedTable =
          typeof resultsTable === 'string' && resultsTable.trim()
            ? resultsTable.trim()
            : null;
        const normalizedResultsTable =
          currentForm?.Item?.resultsTable
          || normalizedProvidedTable
          || buildDefaultResultsTableName(formId);
        const params = {
          TableName: 'forms_table',
          Key: { formId },
          UpdateExpression: 'SET #formStructure = :formStructure, #label = :label, #resultsTable = :resultsTable',
          ExpressionAttributeNames: {
            '#formStructure': 'formStructure',
            '#label': 'label',
            '#resultsTable': 'resultsTable'
          },
          ExpressionAttributeValues: {
            ':formStructure': formStructure,
            ':label': label,
            ':resultsTable': normalizedResultsTable,
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
    
    async deleteFormData(formId) {
      try {
        const params = {
          TableName: 'forms_table',
          Key: { formId },
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

    async upsertFormData(formId, formStructure, label = 'Untitled', user = 'admin', resultsTable = null) {
      try {
        const existingItem = await this.docClient.send(
          new GetCommand({
            TableName: 'forms_table',
            Key: { formId }
          })
        );
        const currentForm = existingItem?.Item || null;
        const normalizedProvidedTable =
          typeof resultsTable === 'string' && resultsTable.trim()
            ? resultsTable.trim()
            : null;
        const normalizedResultsTable =
          currentForm?.resultsTable
          || normalizedProvidedTable
          || buildDefaultResultsTableName(formId);
        const item = {
          formId,
          label,
          user,
          resultsTable: normalizedResultsTable,
          formStructure,
          lastModified: new Date().toISOString()
        };
        const params = {
          TableName: 'forms_table',
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

    // No longer needed: ensureResultsTable (tables are now static)
      

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

    async getFormResults(formId) {
      try {
        if (!formId) return [];
        const params = {
          TableName: 'form_results_table',
          KeyConditionExpression: '#formId = :formIdVal',
          ExpressionAttributeNames: {
            '#formId': 'formId'
          },
          ExpressionAttributeValues: {
            ':formIdVal': formId
          }
        };
        const data = await this.docClient.send(new QueryCommand(params));
        return data.Items || [];
      } catch (error) {
        console.error("🔥 Query Error:", error);
        return [];
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

      async updateDorcasArticle(articleId, updates = {}) {
        const normalizedArticleId = String(articleId || '').trim();
        if (!normalizedArticleId) {
          throw new Error('Missing articleId for dorcasusers update');
        }

        const cleaned = Object.entries(updates || {})
          .filter(([, value]) => value !== undefined)
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});

        const expressionAttributeNames = {
          '#title': 'title',
          '#article': 'article',
          '#photo': 'photo',
          '#updatedAt': 'updatedAt',
          '#updatedBy': 'updatedBy'
        };

        const expressionAttributeValues = {
          ':updatedAt': new Date().toISOString(),
          ':updatedBy': firstNonEmpty(cleaned.updatedBy, 'admin')
        };

        const updateClauses = ['#updatedAt = :updatedAt', '#updatedBy = :updatedBy'];

        if (cleaned.title !== undefined) {
          updateClauses.push('#title = :title');
          expressionAttributeValues[':title'] = String(cleaned.title || '').trim();
        }

        if (cleaned.article !== undefined) {
          updateClauses.push('#article = :article');
          expressionAttributeValues[':article'] = String(cleaned.article || '').trim();
        }

        if (cleaned.photo !== undefined) {
          updateClauses.push('#photo = :photo');
          expressionAttributeValues[':photo'] = normalizePhotoSource(cleaned.photo);
        }

        if (cleaned.color !== undefined) {
          expressionAttributeNames['#style'] = 'style';
          expressionAttributeNames['#color'] = 'color';
          expressionAttributeValues[':color'] = firstNonEmpty(cleaned.color, '#111827');
          updateClauses.push('#style.#color = :color');
        }

        const result = await this.docClient.send(new UpdateCommand({
          TableName: 'dorcasusers',
          Key: { userId: normalizedArticleId },
          UpdateExpression: `SET ${updateClauses.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: 'ALL_NEW',
          ConditionExpression: 'attribute_exists(userId)'
        }));

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
              if (error?.name === 'ResourceNotFoundException') {
                console.warn(`Results table not found: ${tableName}. Returning empty results.`);
                return [];
              }
          console.error("Error fetching all form results:", error);
          throw new Error("Could not fetch all form results");
        }
      }
    
}

function buildDefaultResultsTableName(formId) {
  const normalizedId = String(formId || `form-${Date.now()}`)
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '_');

  return `form_results_${normalizedId}`.slice(0, 255);
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const trimmed = String(value).trim();
    if (trimmed) return trimmed;
  }
  return '';
}

function firstContentField(fields, { excludeKeys = [] } = {}) {
  const excluded = new Set((excludeKeys || []).filter(Boolean));
  const entries = Object.entries(fields || {});
  for (const [key, value] of entries) {
    if (excluded.has(key)) continue;
    if (key === 'messageYear' || key === 'done') continue;
    const normalized = firstNonEmpty(value);
    if (normalized) return normalized;
  }
  return '';
}

function findInputValueByLabel(inputDefs, submittedFields, pattern) {
  const defs = Array.isArray(inputDefs) ? inputDefs : [];
  for (const field of defs) {
    const label = firstNonEmpty(field?.label, field?.text, field?.id).toLowerCase();
    if (!pattern.test(label)) continue;
    const value = firstNonEmpty(submittedFields?.[field.id]);
    if (value) return value;
  }
  return '';
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function normalizePhotoSource(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  if (raw.toLowerCase().startsWith('s3://')) {
    const withoutScheme = raw.slice(5);
    const slashIndex = withoutScheme.indexOf('/');
    if (slashIndex === -1) return '';

    const bucket = withoutScheme.slice(0, slashIndex);
    const key = withoutScheme.slice(slashIndex + 1);
    if (!bucket || !key) return '';

    return `https://${bucket}.s3.eu-north-1.amazonaws.com/${encodeURI(key)}`;
  }

  return raw;
}

function normalizeBrightnessValue(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.max(0, Math.min(300, parsed));
}

export default new DynamoDB();