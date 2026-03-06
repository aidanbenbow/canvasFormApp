import { ACTIONS } from '../../events/actions.js';
import { ROUTES } from '../../routes/routeNames.js';

export function registerArticleEvents({ dispatcher, router }) {
  dispatcher.on(ACTIONS.ARTICLE.VIEW, (article) => {
    router.push(ROUTES.articleView, { article });
  }, 'wiring.articles');

  dispatcher.on(ACTIONS.ARTICLE.EDIT, (article) => {
    router.push(ROUTES.articleEdit, {
      article,
      mode: 'edit'
    });
  }, 'wiring.articles');
}