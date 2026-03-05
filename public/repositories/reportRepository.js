import socket from "../socketClient.js";

// filepath: d:\canvasFormApp\public\repositories\reportRepository.js

export const reportRepository = {
    updateReport(reportId, updates) {
        return new Promise((resolve, reject) => {
            socket.emit("report.update", { reportId, updates });

            socket.once("report.updateResponse", (resp) => {
                resp.success ? resolve(resp.data) : reject(resp.error);
            });
        });
    },

    fetchReport(reportId) {
        return new Promise((resolve, reject) => {
            socket.emit("report.fetch", { reportId });

            socket.once("report.fetchResponse", (resp) => {
                resp.success ? resolve(resp.data) : reject(resp.error);
            });
        });
    },

    fetchAllReports() {
        return new Promise((resolve, reject) => {
            socket.emit("report.fetchAll");

            socket.once("report.fetchAllResponse", (resp) => {
                resp.success ? resolve(resp.data) : reject(resp.error);
            });
        });
    },

    createReport(report) {
        return new Promise((resolve, reject) => {
            socket.emit("report.create", report);

            socket.once("report.createResponse", (resp) => {
                resp.success ? resolve(resp.data) : reject(resp.error);
            });
        });
    }
};