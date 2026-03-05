import { reportRepository } from "../../repositories/reportRepository.js";

export function registerReportCommands(commandRegistry, system) {
  commandRegistry.register("report.save", () => {
    setTimeout(() => {
      system.eventBus.emit("socketFeedback", {
        text: "Report saved successfully!",
        position: { x: 100, y: 50 },
        duration: 2200
      });
    }, 1000);
  });

  commandRegistry.register("report.update", async (payload = {}) => {
    try {
      const resolvedReportId =
        payload?.reportId
        || payload?.id
        || payload?.fields?.reportId
        || payload?.fields?.id
        || payload?.fields?.nameInput
        || payload?.fields?.name
        || payload?.fields?.['input-name'];

      if (!resolvedReportId) {
        throw new Error("Missing reportId");
      }

      const resolvedUpdates = payload?.updates
        || payload?.fields
        || payload?.report
        || {};

      await reportRepository.updateReport(resolvedReportId, resolvedUpdates);

      system.eventBus.emit("socketFeedback", {
        text: "Report updated successfully!",
        position: { x: 100, y: 50 },
        duration: 2200
      });
    } catch (error) {
      system.eventBus.emit("socketFeedback", {
        text: `Failed to update report: ${error?.message || error}`,
        position: { x: 100, y: 50 },
        duration: 2800
      });
    }
  });
}