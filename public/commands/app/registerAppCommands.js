// public/commands/app/registerAppCommands.js

import { formRepository } from "../../repositories/formRepository.js";
import { formResultsRepository } from "../../repositories/formResultsRepository.js";
import { articleRepository } from "../../repositories/articleRepository.js";
import { formService } from "../../services/formservice.js";
import { ScreenRouter } from "../../routes/screenRouter.js";

export function registerAppCommands(commandRegistry, context) {

  // --------------------------------------------------
  // Default App Bootstrap
  // --------------------------------------------------
  commandRegistry.register("app.bootstrap", async () => {
    const forms = await formRepository.fetchAllForms();
    formService.setForms(forms);

    for (const f of forms) {
      const results = await formResultsRepository.fetchResults(f.formId);
      formService.setResults(f.formId, results || []);
    }

    ScreenRouter.replace("dashboard");
  });


  // --------------------------------------------------
  // Deep Link: Open a Specific Form
  // --------------------------------------------------
  commandRegistry.register("app.openForm", async ({ formId }) => {
    const form = await formRepository.fetchFormById(formId);
    if (!form) return;

    const results = await formResultsRepository.fetchResults(formId);

    formService.updateForm(form);
    formService.setResults(formId, results || []);
    formService.setActiveForm(formId);

    ScreenRouter.replace("formView", { formId });
  });


  // --------------------------------------------------
  // Deep Link: Open an Article
  // --------------------------------------------------
  commandRegistry.register("app.openArticle", async ({ articleId, mode }) => {
    const article = await articleRepository.fetchArticleById(articleId);

    ScreenRouter.replace(
      mode === "edit" ? "formEdit" : "formView",
      { article, mode }
    );
  });
}