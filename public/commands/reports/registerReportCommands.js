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
}