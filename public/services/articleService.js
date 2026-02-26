// public/services/articleService.js
import { articlesStore } from "../stores/storeInstance.js";

export const articleService = {
  setArticles(list) {
    const next = {};
    for (const a of list) next[a.articleId] = a;

    const prev = articlesStore.getState().articles;
    // Skip if identical
    const same =
      Object.keys(prev).length === Object.keys(next).length &&
      Object.keys(prev).every(id => prev[id]?.updatedAt === next[id]?.updatedAt);

    if (!same) {
      articlesStore.apply({ articles: next });
    }
  },

  updateArticle(article) {
    const prev = articlesStore.getState().articles;
    const next = {
      ...prev,
      [article.articleId]: article
    };
    articlesStore.apply({ articles: next });
  },

  removeArticle(articleId) {
    const prev = articlesStore.getState().articles;
    const next = { ...prev };
    delete next[articleId];
    articlesStore.apply({ articles: next });
  },

  getArticle(articleId) {
    return articlesStore.getState().articles[articleId] || null;
  },

  getAllArticles() {
    return Object.values(articlesStore.getState().articles);
  },

  subscribe(id, listener) {
    return articlesStore.subscribe(id, listener);
  },

  unsubscribe(id) {
    return articlesStore.unsubscribe(id);
  }
};
