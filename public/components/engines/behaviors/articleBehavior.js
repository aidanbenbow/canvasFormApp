export const noopArticleBehavior = {
  shouldHandle() {
    return false;
  },
  registerCommands() {},
  unregisterCommands() {}
};

export const dorcasArticleBehavior = {
  shouldHandle(form) {
    return String(form?.resultsTable || '').trim().toLowerCase() === 'dorcasusers';
  },
  registerCommands(engine) {
    if (engine.commandRegistry?.has?.(engine.openArticleCommand)) return;

    engine.commandRegistry.register(engine.openArticleCommand, (payload = {}) => {
      const articleId = String(payload?.articleId || '').trim();
      const mode = String(payload?.mode || '').trim().toLowerCase();
      if (!articleId) return;

      const encodedArticleId = encodeURIComponent(articleId);
      const query = mode === 'edit'
        ? `/?articleId=${encodedArticleId}&mode=edit`
        : `/?articleId=${encodedArticleId}`;

      window.open(query, '_blank', 'noopener,noreferrer');
    });
  },
  unregisterCommands(engine) {
    engine.commandRegistry?.unregister?.(engine.openArticleCommand);
  }
};
