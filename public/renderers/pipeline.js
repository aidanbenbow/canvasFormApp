export class RenderPipeline {
    constructor(renderManager) {
      this.renderManager = renderManager;
      this.rendererContext = null;
      this.root = null; // root SceneNode
      this.dirty = true;
      this.running = false;
      this.constraints = { maxWidth: Infinity, maxHeight: Infinity };
      this.editor = null;
      this.currentFrame = 0;
      this.subtreeBudgetMs = 8;
      this.debugSubtreeScheduling = true;
      this.forceFullFrame = false;
      this.lastSubtreeStats = {
        frame: 0,
        processed: 0,
        hasRemaining: false,
        durationMs: 0,
        budgetMs: this.subtreeBudgetMs
      };
    }
  
    setRendererContext(rendererContext) {
      this.rendererContext = rendererContext;
    }

    setEditor(editor) {
      this.editor = editor;
    }
  
    setRoot(rootNode) {
      // 1. Detach old root
      if (this.root) {
        this.root.off("invalidate", this._invalidateHandler);
      }
    
      // 2. Attach new root
      this.root = rootNode;
    console.log("RenderPipeline: New root set:", rootNode);
      // Keep a reference to the handler so we can remove it later
      this._invalidateHandler = () =>{

       this.invalidate();}
      rootNode.on("invalidate", this._invalidateHandler);
      this.forceFullFrame = true;
    
      // 3. Force redraw
      this.invalidate();
    }
  
    invalidate() {
      this.dirty = true;
    }
  
    tick(dt, constraints) {
      if (!this.root) return;

      this.currentFrame += 1;
      const subtreeStart = now();
      const subtreeWork = this.processSubtreeWork(this.root, this.subtreeBudgetMs, this.currentFrame);
      this.lastSubtreeStats = {
        frame: this.currentFrame,
        processed: subtreeWork.processed,
        hasRemaining: subtreeWork.hasRemaining,
        durationMs: now() - subtreeStart,
        budgetMs: this.subtreeBudgetMs
      };
      const shouldRenderFullFrame = this.forceFullFrame || this.dirty;
      if (!shouldRenderFullFrame) {
        this.renderSubtreeDebugOverlay();
        return;
      }

      // 1. Measure
      this.root.measure( constraints, this.rendererContext);
  
      // 2. Layout
      this.root.layout(
        { x: 0, y: 0, width: constraints.maxWidth, height: constraints.maxHeight },
        this.rendererContext
      );
  
      // 3. Update
      this.root.update(dt, this.rendererContext);
  this.updateScrollableNodes(this.root);
      // 4. Render
      this.renderFrame();
      this.forceFullFrame = false;
    }

    processSubtreeWork(root, budgetMs = 8, frameId = 0) {
      const start = now();
      const stack = [root];
      let processed = 0;

      while (stack.length) {
        if (now() - start > budgetMs) {
          break;
        }

        const node = stack.pop();
        const meta = ensureSubtreeMeta(node);
        if (!meta) continue;

        if (meta.dirty) {
          this.reconcileNode(node, frameId);
          clearNodeDirty(node);
          processed += 1;
        }

        if (meta.dirtyChildrenCount > 0 && Array.isArray(node.children) && node.children.length > 0) {
          for (let index = node.children.length - 1; index >= 0; index -= 1) {
            const child = node.children[index];
            const childMeta = ensureSubtreeMeta(child);
            if (!childMeta) continue;
            if (childMeta.dirty || childMeta.dirtyChildrenCount > 0) {
              stack.push(child);
            }
          }
        }
      }

      return {
        processed,
        hasRemaining: hasDirtySubtree(root)
      };
    }

    reconcileNode(node, frameId) {
      const meta = ensureSubtreeMeta(node);
      if (!meta) return;

      meta.lastProcessedFrame = frameId;
      node.reconcileSubtree?.();
    }
    updateScrollableNodes(node) {
      if (node.scroll) node.updateScroll();
      for (const child of node.children) {
        this.updateScrollableNodes(child);
      }
    }
    renderFrame() {
      
      if (!this.dirty) return;
      this.renderManager.clearAll(this.rendererContext);
      if (this.root) {
        this.root.render(this.rendererContext);
      }

      if( this.editor ) {
        this.editor.renderOverlay(this.rendererContext);
      }

      this.renderSubtreeDebugOverlay();

      this.dirty = false;
    }

    renderSubtreeDebugOverlay() {
      if (!this.debugSubtreeScheduling) return;
      const ctx = this.rendererContext;
      if (!ctx) return;

      const stats = this.lastSubtreeStats || {};
      const lines = [
        `subtree frame: ${stats.frame ?? 0}`,
        `processed: ${stats.processed ?? 0}`,
        `remaining: ${stats.hasRemaining ? 'yes' : 'no'}`,
        `budget: ${stats.budgetMs ?? this.subtreeBudgetMs}ms`,
        `work: ${Number(stats.durationMs || 0).toFixed(2)}ms`
      ];

      const panelWidth = 190;
      const panelHeight = 88;
      const margin = 8;
      const x = Math.max(margin, (ctx.canvas?.width || 0) - panelWidth - margin);
      const y = margin;

      ctx.save();
      ctx.font = '12px monospace';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(x, y, panelWidth, panelHeight);
      ctx.fillStyle = '#93c5fd';
      for (let index = 0; index < lines.length; index += 1) {
        ctx.fillText(lines[index], x + 6, y + 16 + index * 14);
      }
      ctx.restore();
    }
  
    start(constraints) {
      this.constraints = constraints;
      if (this.running) return;
      this.running = true;
      let lastTime = performance.now();
  
      const loop = (time) => {
        const dt = time - lastTime;
        lastTime = time;
        this.tick(dt, constraints);
        requestAnimationFrame(loop);
      };
  
      requestAnimationFrame(loop);
    }
  
    stop() {
      this.running = false;
    }
    toSceneCoords(canvasX, canvasY) {
      const scaleX = this.constraints.maxWidth / this.rendererContext.canvas.width;
      const scaleY = this.constraints.maxHeight / this.rendererContext.canvas.height;
    
      return {
        x: canvasX * scaleX,
        y: canvasY * scaleY
      };
    }
  }

function ensureSubtreeMeta(node) {
  if (!node) return null;
  if (!node.subtreeMeta) {
    node.subtreeMeta = {
      dirty: false,
      dirtyChildrenCount: 0,
      lastProcessedFrame: 0
    };
  }
  return node.subtreeMeta;
}

function clearNodeDirty(node) {
  const meta = ensureSubtreeMeta(node);
  if (!meta || !meta.dirty) return;

  meta.dirty = false;

  let parent = node.parent;
  while (parent) {
    const parentMeta = ensureSubtreeMeta(parent);
    if (parentMeta) {
      parentMeta.dirtyChildrenCount = Math.max(0, parentMeta.dirtyChildrenCount - 1);
    }
    parent = parent.parent;
  }
}

function hasDirtySubtree(root) {
  const stack = [root];

  while (stack.length) {
    const node = stack.pop();
    const meta = ensureSubtreeMeta(node);
    if (!meta) continue;

    if (meta.dirty) {
      return true;
    }

    if (meta.dirtyChildrenCount > 0 && Array.isArray(node.children) && node.children.length > 0) {
      for (let index = 0; index < node.children.length; index += 1) {
        stack.push(node.children[index]);
      }
    }
  }

  return false;
}

function now() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
}
