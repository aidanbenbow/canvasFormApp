import { eventBus } from "../app.js";

export class FormResultsOverlay {
    constructor({ ctx, form, onBack }) {
      this.type = 'formResultsOverlay';
      this.ctx = ctx;
      this.form = form;
      this.onBack = onBack;
      this.isOverlay = true;
      this.randomName = '—';
this.randomButtonBounds = null;
this.backBounds = null;
this.scrollOffset = 0;
this.scrollStep = 100; // pixels per scroll
this.scrollDownButtonBounds = null;
this.scrollUpButtonBounds = null;


// 🔄 Listen for live updates
eventBus.on('formResultsUpdated', ({ formId, results }) => {
  if (formId === this.form.id) {
    this.updateResponses(results);
  }
});

    }
    updateResponses(newResponses) {
        this.form.responses = newResponses;
        const named = newResponses.filter(r => r.name);
        const randomEntry = named[Math.floor(Math.random() * named.length)];
        this.randomName = randomEntry?.name ?? '—';
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
  
      // 🔽 Scroll Down Button
ctx.fillStyle = '#555';
ctx.fillRect(400, 140, 100, 30);
ctx.fillStyle = '#fff';
ctx.fillText('Scroll ↓', 420, 160 );
this.scrollDownButtonBounds = {
  x: 400,
  y: 140,
  width: 100,
  height: 30
};

// 🔼 Scroll Up Button
ctx.fillStyle = '#555';
ctx.fillRect(400, 60 , 100, 30);
ctx.fillStyle = '#fff';
ctx.fillText('Scroll ↑', 420, 80);
this.scrollUpButtonBounds = {
  x: 400,
  y: 60,
  width: 100,
  height: 30
};

let yOffset = 60 - this.scrollOffset;
     // 🔹 Render names only
     const responses = this.form.responses || [];
     ctx.font = '14px Arial';
     ctx.fillStyle = '#000';
     
     

     
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
     
     const named = responses.filter(r => r.name);

     
  
      // 🔙 Back button
      ctx.fillStyle = '#007bee';
      ctx.fillRect(300, yOffset, 80, 20);
      ctx.fillStyle = '#fff';
      ctx.fillText('← Back', 310, yOffset + 15);

      this.backBounds = {
        x: 300,
        y: yOffset,
        width: 80,
        height: 20
      };

      // 🧑‍💼 List of names
     named.forEach((entry, i) => {
      ctx.fillText(`• ${entry.name}`, 20, yOffset);
      yOffset += 24;
    });
  
      ctx.restore();
    }
  
    registerHitRegion(hitRegistry) {
      console.log('Registering hit region for FormResultsOverlay');
      hitRegistry.register('form-results-back', {
        type: this.type,
        plugin: this,
        bounds: {
          x: this.ctx.canvas.width - 400,
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
        x >= this.backBounds.x &&
        x <= this.backBounds.x + this.backBounds.width &&
        y >= this.backBounds.y &&
        y <= this.backBounds.y + this.backBounds.height;
  
      if (withinBack && typeof this.onBack === 'function') {
        
        this.onBack();
      }
      const b = this.randomButtonBounds;
const withinRandom =
  b && x >= b.x && x <= b.x + b.width &&
  y >= b.y && y <= b.y + b.height;

if (withinRandom) {
  const named = this.form.responses?.filter(r => r.name) || [];
  const randomEntry = named[Math.floor(Math.random() * named.length)];
  this.randomName = randomEntry?.name ?? '—';
  this.render({ ctx: this.ctx });
  return;
}

const down = this.scrollDownButtonBounds;
const up = this.scrollUpButtonBounds;

const clickedDown =
  down && x >= down.x && x <= down.x + down.width &&
  y >= down.y && y <= down.y + down.height;

const clickedUp =
  up && x >= up.x && x <= up.x + up.width &&
  y >= up.y && y <= up.y + up.height;

if (clickedDown) {
  this.scrollOffset += this.scrollStep;
  this.render({ ctx: this.ctx });
  return;
}

if (clickedUp) {
  this.scrollOffset = Math.max(0, this.scrollOffset - this.scrollStep);
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