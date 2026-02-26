// public/repositories/articleRepository.js
import socket from "../socketClient.js";

export const articleRepository = {
  async updateArticle(articleId, updates) {
    return new Promise((resolve, reject) => {
      socket.emit("updateArticle", { articleId, updates });
      socket.once("updateArticleResponse", resp => {
        resp.success ? resolve(resp.data) : reject(resp.error);
      });
    });
  },
  // Add more methods as needed:
  // async fetchArticle(articleId) { ... }
  // async createArticle(article) { ... }
  // async deleteArticle(articleId) { ... }
};