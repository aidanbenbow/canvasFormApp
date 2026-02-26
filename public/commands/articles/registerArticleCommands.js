import { articleRepository } from "../../repositories/articleRepository.js";
import { articleService } from "../../services/articleService.js";

export function registerArticleCommands(commandRegistry, system) {
  commandRegistry.register("article.save", async (payload) => {
    try {
      const article = await articleRepository.updateArticle(
        payload.articleId,
        payload.updates
      );

      articleService.updateArticle(article);

      system.eventBus.emit("socketFeedback", {
        text: "Article saved successfully!"
      });
    } catch (err) {
      console.error(err);
    }
  });
}