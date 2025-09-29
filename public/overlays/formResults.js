import { eventBus } from "../app.js";
import { utilsRegister } from "../utils/register.js";

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

const get = utilsRegister.get.bind(utilsRegister);
  this.getCanvasSize = get('canvas', 'getCanvasSize');
  this.scaleToCanvas = get('layout', 'scaleToCanvas');
  this.scaleRectToCanvas = get('layout', 'scaleRectToCanvas');
  this.getLogicalFontSize = get('layout', 'getLogicalFontSize');


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
      const { width: canvasW, height: canvasH } = this.getCanvasSize();

      ctx.save();
      ctx.clearRect(0, 0, canvasW, canvasH);

// 🔶 Header
ctx.fillStyle = '#f0f0f0';
ctx.fillRect(0, 0, canvasW, this.scaleToCanvas({ x: 0, y: 40 }, canvasW, canvasH).y);
ctx.fillStyle = '#333';
ctx.font = this.getLogicalFontSize(16, canvasH);
ctx.fillText(`📊 Results for: ${this.form.title}`, 10, 25);

// 🔘 Buttons
const buttons = [
  { label: 'Scroll ↑', x: 800, y: 60, width: 100, height: 30, ref: 'scrollUpButtonBounds', color: '#555' },
  { label: 'Scroll ↓', x: 800, y: 100, width: 100, height: 30, ref: 'scrollDownButtonBounds', color: '#555' },
  { label: '🎲 Pick Random Name', x: 20, y: 60, width: 180, height: 30, ref: 'randomButtonBounds', color: '#28a745' },
  { label: '← Back', x: 220, y: 60, width: 80, height: 30, ref: 'backBounds', color: '#007bee' }
];

buttons.forEach(btn => {
  const rect = this.scaleRectToCanvas(btn, canvasW, canvasH);
  ctx.fillStyle = btn.color;
  
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.fillStyle = '#fff';
  ctx.font = this.getLogicalFontSize(14, canvasH);
  ctx.fillText(btn.label, rect.x + 10, rect.y + rect.height / 1.5);
  this[btn.ref] = rect;
});
const responses = this.form.responses || [];

// 🎲 Random selection
const summaryY = this.scaleToCanvas({ x: 0, y: 100 }, canvasW, canvasH).y;
ctx.fillText(`🎯 Randomly selected: ${this.randomName}`, 20, summaryY);
ctx.fillText(`Total submissions: ${responses.length}`, 20, summaryY + 20);


if (this.form.resultsTable === 'progressreports') {
  const completed = responses.filter(r => r.completed).length;
  const used = responses.filter(r => r.used).length;
  ctx.fillText(`✅ Completed reports: ${completed}`, 20, summaryY + 40);
  ctx.fillText(`📌 Reports marked 'used': ${used}`, 20, summaryY + 60);
}


  const scrollAreaTop = this.scaleToCanvas({ x: 0, y: 200 }, canvasW, canvasH).y;
  const scrollAreaBottom = canvasH - this.scaleToCanvas({ x: 0, y: 40 }, canvasW, canvasH).y;
      const maxVisibleHeight = scrollAreaBottom - scrollAreaTop;
ctx.beginPath();
ctx.rect(0, scrollAreaTop, ctx.canvas.width, maxVisibleHeight);

 
  

ctx.clip();
 
let yOffset = scrollAreaTop - this.scrollOffset;
     // 🔹 Render names only
 
     ctx.font = ctx.font = this.getLogicalFontSize(14, canvasH);

     ctx.fillStyle = '#000';
    
  
    yOffset += 20;
    
      // 🧑‍💼 Responses
  responses.forEach((entry, i) => {
    const blockHeight = 80;
    const blockRect = this.scaleRectToCanvas({ x: 10, y: yOffset, width: 980, height: blockHeight }, canvasW, canvasH);
    if (i % 2 === 0) {
      ctx.fillStyle = '#f9f9f9';
      ctx.fillRect(blockRect.x, blockRect.y, blockRect.width, blockRect.height);
    }

    ctx.fillStyle = '#222';
    ctx.font = this.getLogicalFontSize(14, canvasH);
    ctx.fillText(`${i + 1}. ${entry.name || '—'} (${entry.ocupatie || '—'})`, blockRect.x + 10, blockRect.y + 20);

    ctx.font = this.getLogicalFontSize(12, canvasH);
    ctx.fillStyle = '#000';
    ctx.fillText(`👍 Good: ${entry.good || '—'}`, blockRect.x + 20, blockRect.y + 38);
    ctx.fillText(`💡 Better: ${entry.better || '—'}`, blockRect.x + 20, blockRect.y + 56);
    ctx.fillText(`📘 Learnt: ${entry.learnt || '—'}`, blockRect.x + 20, blockRect.y + 74);

    yOffset += blockHeight + 10;
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