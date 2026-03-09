// public/repositories/formResultsRepository.js
import socket from "../socketClient.js";

export const formResultsRepository = {
  saveResult({ formId, userId, payload }) {
    return new Promise((resolve, reject) => {
      socket.emit("formResults.save", { formId, userId, payload });

      socket.once("formResults.saveResponse", (resp) => {
        resp.success ? resolve(resp.data) : reject(resp.error);
      });
    });
  },

  fetchResults(formId) {
    return new Promise((resolve, reject) => {
      socket.emit("formResults.fetch", { formId });

      socket.once("formResults.fetchResponse", (resp) => {
        resp.success ? resolve(resp.data) : reject(resp.error);
      });
    });
  },

  fetchAllResults(tableName) {
    return new Promise((resolve, reject) => {
      socket.emit("formResults.fetchAll", { tableName });

      socket.once("formResults.fetchAllResponse", (resp) => {
        resp.success ? resolve(resp.data) : reject(resp.error);
      });
    });
  },

  updateResult({ formId, createdAt, payload }) {
    return new Promise((resolve, reject) => {
      socket.emit("formResults.update", { formId, createdAt, payload });

      socket.once("formResults.updateResponse", (resp) => {
        resp.success ? resolve(resp.data) : reject(resp.error);
      });
    });
  }
};