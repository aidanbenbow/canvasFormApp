// db/articleDB.js
import { docClient } from "./dynamoClient.js";
import { PutCommand, UpdateCommand, ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";

export async function createArticle({
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
  if (!articleId) throw new Error("Missing articleId");

  const now = Date.now();
  const numericPublishedAt =
    status === "published" ? Number(publishedAt ?? now) : undefined;

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

  await docClient.send(new PutCommand({
    TableName: "articles_table",
    Item: item
  }));

  return item;
}

export async function updateArticle(articleId, updates = {}) {
  const normalizedArticleId = String(articleId || "").trim();
  if (!normalizedArticleId) throw new Error("Missing articleId");

  const IMMUTABLE_FIELDS = new Set(["articleId", "createdAt", "createdBy"]);
  const NUMERIC_FIELDS = new Set(["publishedAt", "updatedAt"]);

  const safeUpdates = { ...updates, updatedAt: Date.now() };

  for (const field of IMMUTABLE_FIELDS) delete safeUpdates[field];

  for (const field of NUMERIC_FIELDS) {
    if (field in safeUpdates) {
      const v = Number(safeUpdates[field]);
      if (Number.isFinite(v)) safeUpdates[field] = v;
      else delete safeUpdates[field];
    }
  }

  const setClauses = [];
  const removeClauses = [];
  const names = {};
  const values = {};

  let i = 0;
  for (const [key, value] of Object.entries(safeUpdates)) {
    if (value === undefined) continue;
    i++;

    const nameKey = `#f${i}`;
    names[nameKey] = key;

    if (value === null) {
      removeClauses.push(nameKey);
    } else {
      const valueKey = `:v${i}`;
      values[valueKey] = value;
      setClauses.push(`${nameKey} = ${valueKey}`);
    }
  }

  if (!setClauses.length && !removeClauses.length)
    throw new Error("No valid update fields");

  let updateExpression = "";
  if (setClauses.length) updateExpression += "SET " + setClauses.join(", ");
  if (removeClauses.length)
    updateExpression += (updateExpression ? " " : "") + "REMOVE " + removeClauses.join(", ");

  const result = await docClient.send(
    new UpdateCommand({
      TableName: "articles_table",
      Key: { articleId: normalizedArticleId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: Object.keys(values).length ? values : undefined,
      ConditionExpression: "attribute_exists(articleId)",
      ReturnValues: "ALL_NEW"
    })
  );

  return result.Attributes;
}

// -----------------------------
// FETCH ONE
// -----------------------------
export async function fetchArticle(articleId) {
  const normalizedArticleId = String(articleId || "").trim();
  if (!normalizedArticleId) throw new Error("Missing articleId");

  const result = await docClient.send(
    new GetCommand({
      TableName: "articles_table",
      Key: { articleId: normalizedArticleId }
    })
  );

  return result.Item || null;
}

// -----------------------------
// FETCH ALL
// -----------------------------
export async function fetchAllArticles({
  limit = 50,
  exclusiveStartKey,
  filterExpression,
  expressionAttributeNames,
  expressionAttributeValues
} = {}) {
  const params = {
    TableName: "articles_table",
    Limit: limit > 0 ? limit : 50
  };

  if (exclusiveStartKey) params.ExclusiveStartKey = exclusiveStartKey;
  if (filterExpression) params.FilterExpression = filterExpression;
  if (expressionAttributeNames) params.ExpressionAttributeNames = expressionAttributeNames;
  if (expressionAttributeValues) params.ExpressionAttributeValues = expressionAttributeValues;

  const result = await docClient.send(new ScanCommand(params));

  return {
    items: result.Items || [],
    lastEvaluatedKey: result.LastEvaluatedKey || null
  };
}
