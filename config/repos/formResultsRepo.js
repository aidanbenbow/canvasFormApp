// repositories/formResultsRepository.js
import * as formResultsDB from "../db/formResultsDB.js";

export const formResultsRepository = {
  saveResult: formResultsDB.saveFormResult,
  fetchResults: formResultsDB.getFormResults,
  fetchAllResults: formResultsDB.getAllFormResults
};