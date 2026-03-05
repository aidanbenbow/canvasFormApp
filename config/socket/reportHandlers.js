import { reportRepository } from '../repos/reportRepo.js';

export function registerReportHandlers(io, socket) {
  socket.on('report.update', async ({ reportId, updates } = {}) => {
    try {
      const updated = await reportRepository.updateReport(reportId, updates);
      socket.emit('report.updateResponse', { success: true, data: updated });
    } catch (err) {
      socket.emit('report.updateResponse', { success: false, error: err.message });
    }
  });

  socket.on('report.fetch', async ({ reportId } = {}) => {
    try {
      const report = await reportRepository.fetchReport(reportId);
      socket.emit('report.fetchResponse', { success: true, data: report });
    } catch (err) {
      socket.emit('report.fetchResponse', { success: false, error: err.message });
    }
  });

  socket.on('report.fetchAll', async () => {
    try {
      const reports = await reportRepository.fetchAllReports();
      socket.emit('report.fetchAllResponse', { success: true, data: reports });
    } catch (err) {
      socket.emit('report.fetchAllResponse', { success: false, error: err.message });
    }
  });

  socket.on('report.create', async (payload = {}) => {
    try {
      const created = await reportRepository.createReport(payload);
      socket.emit('report.createResponse', { success: true, data: created });
    } catch (err) {
      socket.emit('report.createResponse', { success: false, error: err.message });
    }
  });
}