// public/repositories/formRepository.js
import socket from "../socketClient.js";

export const formRepository = {
  createForm(form) {
    return new Promise((resolve, reject) => {
      socket.emit("form.create", form);
      socket.once("form.createResponse", resp => {
        resp.success ? resolve(resp.data) : reject(resp.error);
      });
    });
  },

  updateForm(formId, updates) {
    return new Promise((resolve, reject) => {
      socket.emit("form.update", { formId, updates });
      socket.once("form.updateResponse", resp => {
        resp.success ? resolve(resp.data) : reject(resp.error);
      });
    });
  },

  deleteForm(formId) {
    return new Promise((resolve, reject) => {
      socket.emit("form.delete", { formId });
      socket.once("form.deleteResponse", resp => {
        resp.success ? resolve(resp.data) : reject(resp.error);
      });
    });
  },

  fetchForm(formId) {
    return new Promise((resolve, reject) => {
      socket.emit("form.fetch", { formId });
      socket.once("form.fetchResponse", resp => {
        resp.success ? resolve(resp.data) : reject(resp.error);
      });
    });
  },

  fetchAllForms() {
    return new Promise((resolve, reject) => {
      socket.emit("form.fetchAll");
      socket.once("form.fetchAllResponse", resp => {
        resp.success ? resolve(resp.data) : reject(resp.error);
      });
    });
  }
};