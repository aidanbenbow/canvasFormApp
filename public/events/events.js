import { eventBus } from "../app.js";


eventBus.on("view", (form) => {
    console.log("View event received");
    console.log("Form data:", form);
});