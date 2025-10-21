export class RenderManager {
    constructor(renderRegistry) {
        this.registry = renderRegistry; // Instance of RendererRegistry
        this.fallbackRenderer = null;
    }

    setFallbackRenderer(renderer) {
        this.fallbackRenderer = renderer;
    }

    render(drawable, context) {
        const isFirstScreenRender = context.firstScreen;
        const renderer = isFirstScreenRender
          ? this.registry.get('formIcon')
          : this.registry.get(drawable.type) || this.fallbackRenderer;
     
        if (renderer?.render) {
          renderer.render(drawable, context);
        } else if (typeof drawable.render === 'function') {
           
          drawable.render(context); // ✅ Self-rendering fallback
        }
      }
      

    clearAll(rendererContext) {
        for (const renderer of this.registry.getAll()) {
            renderer?.clear?.(rendererContext); // Optional clear method per renderer
        }
        this.fallbackRenderer?.clear?.(rendererContext);
    }
}