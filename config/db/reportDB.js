import { docClient } from './dynamoClient.js';
import {
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = 'progress_reports_table';

function normalizeReportAliases(source = {}) {
  const normalized = { ...source };

  const message =
    normalized.message
    ?? normalized.messageInput
    ?? normalized.messageinput
    ?? normalized['message-input'];

  const report =
    normalized.report
    ?? normalized.reportInput
    ?? normalized.reportinput
    ?? normalized['report-input'];

  const messageYearRaw =
    normalized.messageYear
    ?? normalized.message_year
    ?? normalized['message-year'];
  const parsedMessageYear = Number(messageYearRaw);
  const messageYear = Number.isFinite(parsedMessageYear) ? parsedMessageYear : 26;

  if (message !== undefined) normalized.message = message;
  if (report !== undefined) normalized.report = report;
  normalized.messageYear = messageYear;

  delete normalized.messageInput;
  delete normalized.messageinput;
  delete normalized['message-input'];
  delete normalized.reportInput;
  delete normalized.reportinput;
  delete normalized['report-input'];
  delete normalized.message_year;
  delete normalized['message-year'];
  delete normalized.nameInput;
  delete normalized.name;
  delete normalized['input-name'];

  return normalized;
}

export async function updateReport(reportId, updates = {}) {
  const normalizedReportId = String(reportId || '').trim();
  if (!normalizedReportId) {
    throw new Error('Missing reportId');
  }

  const IMMUTABLE_FIELDS = new Set(['reportId', 'id', 'createdAt']);
  const safeUpdates = {
    ...normalizeReportAliases(updates),
    updatedAt: new Date().toISOString()
  };

  for (const field of IMMUTABLE_FIELDS) {
    delete safeUpdates[field];
  }

  const setClauses = [];
  const removeClauses = [];
  const names = {};
  const values = {};

  let index = 0;
  for (const [key, value] of Object.entries(safeUpdates)) {
    if (value === undefined) continue;
    index += 1;

    const nameKey = `#f${index}`;
    names[nameKey] = key;

    if (value === null) {
      removeClauses.push(nameKey);
    } else {
      const valueKey = `:v${index}`;
      values[valueKey] = value;
      setClauses.push(`${nameKey} = ${valueKey}`);
    }
  }

  if (!setClauses.length && !removeClauses.length) {
    throw new Error('No valid update fields');
  }

  let updateExpression = '';
  if (setClauses.length) updateExpression += `SET ${setClauses.join(', ')}`;
  if (removeClauses.length) {
    updateExpression += `${updateExpression ? ' ' : ''}REMOVE ${removeClauses.join(', ')}`;
  }

  const result = await docClient.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { reportId: normalizedReportId },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: Object.keys(values).length ? values : undefined,
    ConditionExpression: 'attribute_exists(reportId)',
    ReturnValues: 'ALL_NEW'
  }));

  return result.Attributes || null;
}

export async function fetchReport(reportId) {
  const normalizedReportId = String(reportId || '').trim();
  if (!normalizedReportId) {
    throw new Error('Missing reportId');
  }

  const result = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { reportId: normalizedReportId }
  }));

  return result.Item || null;
}

export async function fetchAllReports() {
  const result = await docClient.send(new ScanCommand({
    TableName: TABLE_NAME
  }));

  return result.Items || [];
}

export async function createReport(report = {}) {
  const reportId = String(report.reportId || report.id || '').trim();
  if (!reportId) {
    throw new Error('Missing reportId');
  }

  const now = new Date().toISOString();
  const normalizedReport = normalizeReportAliases(report);
  const item = {
    ...normalizedReport,
    reportId,
    createdAt: normalizedReport.createdAt || now,
    updatedAt: now
  };

  await docClient.send(new PutCommand({
    TableName: TABLE_NAME,
    Item: item
  }));

  return item;
}