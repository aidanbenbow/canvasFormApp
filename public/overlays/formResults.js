export class FormResultsOverlay {
    constructor({ ctx, form, onBack }) {
      this.type = 'formResultsOverlay';
      this.ctx = ctx;
      this.form = form;
      this.onBack = onBack;
      this.isOverlay = true;
      this.randomName = '—';
this.randomButtonBounds = null;

    }
    updateResponses(newResponses) {
        this.form.responses = newResponses;
        const named = newResponses.filter(r => r.input0);
        const randomEntry = named[Math.floor(Math.random() * named.length)];
        this.randomName = randomEntry?.input0 ?? '—';
        this.ctx && this.render({ ctx: this.ctx });
      }
      
  
    render({ ctx }) {
      ctx.save();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
      // 🔶 Header
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, ctx.canvas.width, 40);
      ctx.fillStyle = '#333';
      ctx.font = '16px Arial';
      ctx.fillText(`📊 Results for: ${this.form.title}`, 10, 25);
  
      // 🔹 Render form results
     // 🔹 Render names only
     const responses = this.form.responses || [];
     ctx.font = '14px Arial';
     ctx.fillStyle = '#000';
     
     let yOffset = 60;
     
     // 🧮 Total count
     ctx.fillText(`Total submissions: ${responses.length}`, 20, yOffset);
     yOffset += 30;

     // 🧑‍💼 Progress report metrics
if (this.form.resultsTable === 'progressreports') {
  const completed = responses.filter(r => r.completed === true).length;
  const used = responses.filter(r => r.used).length;

  ctx.fillText(`✅ Completed reports: ${completed}`, 20, yOffset);
  yOffset += 24;

  ctx.fillText(`📌 Reports marked 'used': ${used}`, 20, yOffset);
  yOffset += 30;
}

// 🎲 Pick Random Name button
ctx.fillStyle = '#28a745';
ctx.fillRect(20, yOffset, 180, 30);
ctx.fillStyle = '#fff';
ctx.font = '14px Arial';
ctx.fillText('🎲 Pick Random Name', 30, yOffset + 20);

this.randomButtonBounds = {
  x: 20,
  y: yOffset,
  width: 180,
  height: 30
};

yOffset += 40;

     
     // 🎲 Random selection
     
     ctx.fillText(`🎯 Randomly selected: ${this.randomName}`, 20, yOffset);
     yOffset += 40;
     
     const named = responses.filter(r => r.input0);

     // 🧑‍💼 List of names
     named.forEach((entry, i) => {
       ctx.fillText(`• ${entry.input0}`, 20, yOffset);
       yOffset += 24;
     });
  
      // 🔙 Back button
      ctx.fillStyle = '#007bff';
      ctx.fillRect(ctx.canvas.width - 100, 10, 80, 20);
      ctx.fillStyle = '#fff';
      ctx.fillText('← Back', ctx.canvas.width - 90, 25);
  
      ctx.restore();
    }
  
    registerHitRegion(hitRegistry) {
      hitRegistry.register('form-results-back', {
        type: this.type,
        plugin: this,
        bounds: {
          x: this.ctx.canvas.width - 100,
          y: 10,
          width: 80,
          height: 20
        }
      });
    }
  
    drawHitRegion(hitCtx) {
      hitCtx.fillStyle = '#0000ff';
      hitCtx.fillRect(this.ctx.canvas.width - 100, 10, 80, 20);
    }
  
    handleClick(x, y) {
      const withinBack =
        x >= this.ctx.canvas.width - 100 &&
        x <= this.ctx.canvas.width - 20 &&
        y >= 10 &&
        y <= 30;
  
      if (withinBack && typeof this.onBack === 'function') {
        this.onBack();
      }
      const b = this.randomButtonBounds;
const withinRandom =
  b && x >= b.x && x <= b.x + b.width &&
  y >= b.y && y <= b.y + b.height;

if (withinRandom) {
  const named = this.form.responses?.filter(r => r.input0) || [];
  const randomEntry = named[Math.floor(Math.random() * named.length)];
  this.randomName = randomEntry?.input0 ?? '—';
  this.render({ ctx: this.ctx });
  return;
}

    }
  
    getHitHex() {
      return 'form-results-001';
    }
  
    getHitColor() {
      return '#0000ff';
    }
  }