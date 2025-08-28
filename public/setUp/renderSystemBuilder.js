import { RenderManager } from "../managers/render.js";
import { RenderPipeline } from "../renderers/pipeline.js";
import { RendererSystem } from "../renderers/renderSystem.js";
import { RendererContext } from "../renderers/rendererContext.js";


export class RenderSystemBuilder {
    constructor(canvasManager, eventBus, rendererRegistry){
        this.canvasManager = canvasManager;
        this.eventBus = eventBus;
        this.rendererRegistry = rendererRegistry;

        this.renderManager =  new RenderManager(this.rendererRegistry);
        this.pipeline = new RenderPipeline(this.renderManager);
        this.pipeline.setRendererContext(this.canvasManager.getContext());
        this.components = {};
        
        this.attachRendererHooks();
    }
    createRendererContext(layer = 'main') {
        const context = new RendererContext({
            ctx: this.canvasManager.getContext(layer),
            hitCtx: this.canvasManager.getHitContext(layer),
            pipeline: this.pipeline,
            textEditorController: this.textEditorController|| null,
            selectionController: this.selectionController|| null,
            interactionManager: this.interactionManager|| null,
            focusManager: this.focusManager|| null,
            boxManager: this.boxManager|| null,
            boxHitManager: this.boxHitManager || null
          });
        
          this.components.rendererContext = context;
          return context;
      }

      createRendererSystem() {
        const system = new RendererSystem(this.pipeline);
        this.components.rendererSystem = system;
        return system;
      }

      registerFromManifest(manifest) {
        manifest.renderers.forEach(({ id, class: RendererClass }) => {
          const instance = new RendererClass();
          this.rendererRegistry.register(id, instance);
        });
      }
      attachLifecycleHooks() {
        this.eventBus.on('beforeRender', () => {
          // maybe flush dirty regions or prep overlays
        });
        this.eventBus.on('afterRender', () => {
          // diagnostics, plugin hooks, etc.
        });
      }
      setFallbackRenderer(renderer) {
        this.renderManager.setFallbackRenderer(renderer);
      }
      attachRendererHooks() {
        this.rendererRegistry.on('onRegister', (type, renderer) => {
          console.log(`[RENDERER] Registered renderer for type: ${type}`);
          this.eventBus.emit('rendererRegistered', { type, renderer });
        });
      
        this.rendererRegistry.on('onOverride', (type, renderer) => {
          console.warn(`[RENDERER] Overrode renderer for type: ${type}`);
          this.eventBus.emit('rendererOverridden', { type, renderer });
        });
      }
      usePlugin(plugin) {
        plugin.registerRenderers?.(this.rendererRegistry, this.eventBus);
        plugin.registerActions?.(this.actionRegistry); // if you support actions
        plugin.registerOverlays?.(this.overlayRegistry); // if overlays are modular
        plugin.registerLifecycle?.(this.eventBus); // optional lifecycle hooks
      }
     

}