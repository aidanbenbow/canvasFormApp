import { FormIconRenderer } from "../renderers/formIcon.js";



export const formIconPlugin = {
    registerRenderers(registry, eventBus) {
      registry.register('formIcon', new FormIconRenderer(eventBus));
    }
  };