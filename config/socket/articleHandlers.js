// socket/articleHandlers.js
import { articleRepository } from "../repos/articleRepo.js";

export function registerArticleHandlers(io, socket) {

  socket.on("article.update", async ({ articleId, updates }) => {
    try {
      const updated = await articleRepository.updateArticle(articleId, updates);
      socket.emit("article.updateResponse", { success: true, data: updated });
    } catch (err) {
      socket.emit("article.updateResponse", { success: false, error: err.message });
    }
  });

  socket.on("article.fetch", async ({ articleId }) => {
    try {
      const article = await articleRepository.fetchArticle(articleId);
      socket.emit("article.fetchResponse", { success: true, data: article });
    } catch (err) {
      socket.emit("article.fetchResponse", { success: false, error: err.message });
    }
  });

  socket.on("article.fetchAll", async () => {
    try {
      const articles = await articleRepository.fetchAllArticles();
      socket.emit("article.fetchAllResponse", { success: true, data: articles });
    } catch (err) {
      socket.emit("article.fetchAllResponse", { success: false, error: err.message });
    }
  });

  socket.on("article.create", async (payload) => {
    try {
      const created = await articleRepository.createArticle(payload);
      socket.emit("article.createResponse", { success: true, data: created });
    } catch (err) {
      socket.emit("article.createResponse", { success: false, error: err.message });
    }
  });
}