// public/repositories/articleRepository.js
import socket from "../socketClient.js";

export const articleRepository = {
  updateArticle(articleId, updates) {
    return new Promise((resolve, reject) => {
      socket.emit("article.update", { articleId, updates });

      socket.once("article.updateResponse", (resp) => {
        resp.success ? resolve(resp.data) : reject(resp.error);
      });
    });
  },

  fetchArticle(articleId) {
    return new Promise((resolve, reject) => {
      socket.emit("article.fetch", { articleId });

      socket.once("article.fetchResponse", (resp) => {
        resp.success ? resolve(resp.data) : reject(resp.error);
      });
    });
  },

  fetchAllArticles() {
    return new Promise((resolve, reject) => {
      socket.emit("article.fetchAll");

      socket.once("article.fetchAllResponse", (resp) => {
        resp.success ? resolve(resp.data) : reject(resp.error);
      });
    });
  },

  createArticle(article) {
    return new Promise((resolve, reject) => {
      socket.emit("article.create", article);

      socket.once("article.createResponse", (resp) => {
        resp.success ? resolve(resp.data) : reject(resp.error);
      });
    });
  }
};