import * as articleDB from "../db/articleDB.js";

export const articleRepository = {
  createArticle: articleDB.createArticle,
  updateArticle: articleDB.updateArticle,
  fetchArticle: articleDB.fetchArticle,      // if you add it
  fetchAllArticles: articleDB.fetchAllArticles
};