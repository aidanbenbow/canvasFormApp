// socket/formResultsHandlers.js
import { formResultsRepository } from "../repos/formResultsRepo.js";

export function registerFormResultsHandlers(io, socket) {

  socket.on("formResults.fetch", async ({ formId, tableName }) => {
    try {
      const results = await formResultsRepository.fetchResults(formId, tableName);
      socket.emit("formResults.fetchResponse", { success: true, data: results });
    } catch (err) {
      socket.emit("formResults.fetchResponse", { success: false, error: err.message });
    }
  });

  socket.on("formResults.fetchAll", async ({ tableName }) => {
    try {
      const results = await formResultsRepository.fetchAllResults(tableName);
      socket.emit("formResults.fetchAllResponse", { success: true, data: results });
    } catch (err) {
      socket.emit("formResults.fetchAllResponse", { success: false, error: err.message });
    }
  });

  socket.on("formResults.save", async (payload) => {
    try {
      const saved = await formResultsRepository.saveResult(payload);
      socket.emit("formResults.saveResponse", { success: true, data: saved });
    } catch (err) {
      socket.emit("formResults.saveResponse", { success: false, error: err.message });
    }
  });
}