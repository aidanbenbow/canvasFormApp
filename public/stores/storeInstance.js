// Singleton instance for ArticlesStore
import { ArticlesStore } from "./ArticlesStore.js";
import { FormStore } from "./formStore.js";

export const formStore = new FormStore();

export const articlesStore = new ArticlesStore();
