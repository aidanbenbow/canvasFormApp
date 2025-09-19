export class AdminOverlay {
    constructor(ctx) {
      this.type = 'adminOverlay'; // So pipeline can identify it
      this.ctx = ctx;
      this.plugins = [];
      this.isOverlay = true; // Optional: used by pipeline.clearOverlay()
      this.mode = 'admin'
    }
  setMode(mode){
    this.mode = mode
  }

    register(plugin) {
      if (plugin?.render && typeof plugin.render === 'function') {
        this.plugins.push(plugin);
      }
    }

    unregister(plugin) {
      const index = this.plugins.indexOf(plugin);
      if (index !== -1) {
        this.plugins.splice(index, 1);
      }
    }

    showMessage(text, position, duration) {
        const messagePlugin = this.plugins.find(p => p.type === 'messageOverlay');
        if (messagePlugin) {
          messagePlugin.showMessage(text, position, duration);
        }
      }
    
  
    render(rendererContext) {
        
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

 // 🔶 Draw admin banner
 if(this.mode === 'admin'){
 this.ctx.save();
 this.ctx.fillStyle = 'rgba(255, 204, 0, 0.3)'; // translucent yellow
 this.ctx.fillRect(0, 0, this.ctx.canvas.width, 40);

 this.ctx.fillStyle = 'black';
 this.ctx.font = '16px Arial';
 this.ctx.fillText('🛠️ Admin Mode Active', 10, 25);
 this.ctx.restore();
 }

      this.plugins.forEach(plugin => plugin.render({ ctx: this.ctx }));
    }
    registerHitRegions(hitRegistry) {
      this.plugins.forEach(plugin => {
        if (typeof plugin.registerHitRegion === 'function') {
          plugin.registerHitRegion(hitRegistry);
        }
      });
    }
    
    drawHitRegions(hitCtx) {
      this.plugins.forEach(plugin => {
        if (typeof plugin.drawHitRegion === 'function') {
          plugin.drawHitRegion(hitCtx);
        }
      });
    }
  }