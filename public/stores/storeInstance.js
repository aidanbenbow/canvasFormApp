// Singleton instance for ArticlesStore
import { setFormStore } from "../services/formservice.js";
import { ArticlesStore } from "./ArticlesStore.js";
import { FormStore } from "./formStore.js";

export const formStore = new FormStore();
setFormStore(formStore);

export const articlesStore = new ArticlesStore();
