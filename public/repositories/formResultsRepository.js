// repositories/formResultsRepository.js
export const formResultsRepository = {
  async saveResult({ formId, userId, payload }) {
    return db.saveFormResult({ formId, userId, payload });
  },

  async fetchResults(formId, tableName) {
    return db.getFormResults(formId, tableName);
  },

  async fetchAllResults(tableName) {
    return db.getAllFormResults(tableName);
  }
};