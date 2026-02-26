// repositories/authRepository.js
import * as authDB from "../db/authDB.js";

export const authRepository = {
  saveSession: authDB.saveSession,
  getSession: authDB.getSession
};