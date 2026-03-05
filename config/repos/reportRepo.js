import * as reportDB from '../db/reportDB.js';

export const reportRepository = {
  updateReport: reportDB.updateReport,
  fetchReport: reportDB.fetchReport,
  fetchAllReports: reportDB.fetchAllReports,
  createReport: reportDB.createReport
};