import { UIStage } from "../components/uiStage.js";
import { DragController } from "../controllers/dragController.js";
import { TextEditorController } from "../controllers/textEditor.js";


import { RenderManager } from "../managers/render.js";
import { ActionRegistry } from "../registries/actionRegistry.js";
import { AssetRegistry } from "../registries/assetRegistry.js";
import { HitRegistry } from "../registries/hitRegistry.js";
import { RenderPipeline } from "../renderers/pipeline.js";
import { RendererSystem } from "../renderers/renderSystem.js";
import { RendererContext } from "../renderers/rendererContext.js";
import { utilsRegister } from "../utils/register.js";


export class RenderSystemBuilder {
    constructor(canvasManager, eventBus, rendererRegistry, layoutManager, layoutRenderer) {
        this.canvasManager = canvasManager;
        this.eventBus = eventBus;
        this.rendererRegistry = rendererRegistry;
        const hitCtx = this.canvasManager.getHitContext('main');        
        this.layoutManager = layoutManager;
        this.layoutRenderer = layoutRenderer;
        this.uiStage = new UIStage({ layoutManager: this.layoutManager, layoutRenderer: this.layoutRenderer });
        this.actionRegistry = new ActionRegistry();
        this.assetRegistry = new AssetRegistry();
        this.hitRegistry = new HitRegistry();
       
        
        this.renderManager =  new RenderManager(this.rendererRegistry);
        this.pipeline = new RenderPipeline(this.renderManager);
        this.pipeline.setRendererContext(this.canvasManager.getContext());
        this.textEditorController = new TextEditorController(this.pipeline);
        this.components = {};
        this.dragController = new DragController(this.pipeline);
       
    }
    createRendererContext(layer = 'main') {
        const context = new RendererContext({
            ctx: this.canvasManager.getContext(layer),
            hitCtx: this.canvasManager.getHitContext(layer),
            hitRegistry: null,
            hitManager: this.hitManager,
            pipeline: this.pipeline,
            textEditorController: this.textEditorController|| null,
            selectionController: this.selectionController|| null,
            focusManager: this.focusManager|| null,
            
            assetRegistry: this.assetRegistry || null,
            canvas: this.canvasManager.layers[layer].canvas || null,
            uiStage: this.uiStage || null,
            dragController: this.dragController || null,
          });
        
          this.components.rendererContext = context;
          return context;
      }

      createInteractionContext() {
      }

      createRendererSystem() {
        const system = new RendererSystem(this.pipeline);
        this.components.rendererSystem = system;
        return system;
      }

      registerFromManifest(manifest) {
        manifest.renderers.forEach(({ id, class: RendererClass, factory }) => {
        
          const instance = factory ? factory(): new RendererClass();
          
          this.rendererRegistry.register(id, instance);
        });
        const loadImage = utilsRegister.get('asset', 'loadImage');
        Object.entries(manifest.images || {}).forEach(([key, path]) => {

          const image = loadImage(path); // preload or lazy-load
          this.assetRegistry.register(key, image);
        });

        Object.entries(manifest.actions || {}).forEach(([key, fn]) => {
          this.actionRegistry?.register(key, fn);
          // console.log(`[ACTION] Registered action: ${key}`);
        });
      
      
      }
      attachLifecycleHooks() {
        this.eventBus.on('beforeRender', () => {
          this.hitRegistry.clear();
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
          // console.log(`[RENDERER] Registered renderer for type: ${type}`);
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