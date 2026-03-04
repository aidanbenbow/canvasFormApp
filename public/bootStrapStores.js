import { formStore } from "./stores/storeInstance.js";
import { formService } from "./services/formservice.js";

export function bootstrapStores(system, context) {
  formStore.connect(system.eventBus);
  context.store = formStore;
  context.formService = formService;
  return { formStore, formService };
}