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
this.logicalBlockHeight = 100;
this.lastTouchY = null;
this.isTouchScrolling = false;
this.eventsBound = false;
this.scrollVelocity = 0;
this.isDragging = false;

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

      // ✅ Arrow function class properties
  handlePointerDown = (e) => {
    this.lastTouchY = e.clientY;
    this.isDragging = true;
    this.ctx.canvas.setPointerCapture(e.pointerId);
    requestAnimationFrame(this.tickScroll);
  };

  // handlePointerMove = (e) => {
  //   if (e.pressure > 0 || e.buttons) {
  //     const deltaY = this.lastTouchY - e.clientY;
  //     this.lastTouchY = e.clientY;
  
  //     this.scrollOffset += deltaY;
  //     this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, this.getMaxScroll()));
  //     this.render({ ctx: this.ctx });
  //   }
  // };

  handlePointerMove = (e) => {
    if(!this.isDragging) return;
    const deltaY = this.lastTouchY - e.clientY;
    this.lastTouchY = e.clientY;
    this.scrollVelocity = deltaY;
  };
  
  tickScroll = () => {
    if (Math.abs(this.scrollVelocity) > 0.1|| this.isDragging) {
      this.scrollOffset += this.scrollVelocity;
      this.scrollOffset = Math.max(0, Math.min(this.scrollOffset, this.getMaxScroll()));
      this.scrollVelocity *= 0.9; // decay
    this.ctx &&  this.render({ ctx: this.ctx });
      requestAnimationFrame(this.tickScroll);
    }
    if (Math.abs(this.scrollVelocity) < 0.1 && !this.isDragging) {
      this.scrollVelocity = 0;
      return; // ✅ Stop loop
    }
  };
  

  handlePointerUp = () => {
    this.lastTouchY = null;
    this.isDragging = false;
    requestAnimationFrame(this.tickScroll);
  };
      bindEvents() {
        if(this.eventsBound) return;
        const canvas = this.ctx.canvas;
      
        canvas.addEventListener('pointerdown', this.handlePointerDown);
        canvas.addEventListener('pointermove', this.handlePointerMove);
        canvas.addEventListener('pointerup', this.handlePointerUp);
        this.eventsBound = true;
      }
      
      unbindEvents() {
        if(!this.eventsBound) return;
        const canvas = this.ctx.canvas;
      
        canvas.removeEventListener('pointerdown', this.handlePointerDown);
        canvas.removeEventListener('pointermove', this.handlePointerMove);
        canvas.removeEventListener('pointerup', this.handlePointerUp);
        this.eventsBound = false;
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
  { label: 'Scroll ↑', x: 800, y: 60, width: 140, height: 40, ref: 'scrollUpButtonBounds', color: '#555' },
  { label: 'Scroll ↓', x: 800, y: 100, width: 140, height: 40, ref: 'scrollDownButtonBounds', color: '#555' },
  { label: '🎲 Pick Random Name', x: 20, y: 60, width: 200, height: 40, ref: 'randomButtonBounds', color: '#28a745' },
  { label: '← Back', x: 220, y: 60, width: 100, height: 40, ref: 'backBounds', color: '#007bee' }
];

buttons.forEach(btn => {
  const rect = this.scaleRectToCanvas(btn, canvasW, canvasH);
  ctx.fillStyle = btn.color;
  
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.fillStyle = '#fff';
  ctx.font = this.getLogicalFontSize(16, canvasH);
  ctx.fillText(btn.label, rect.x + 10, rect.y + rect.height / 1.5);
  this[btn.ref] = rect;
});
const responses = this.form.responses || [];

// 🎲 Random selection
ctx.font = `bold ${this.getLogicalFontSize(20, canvasH)}`;
const buttonBottomY = this.scaleToCanvas({ x: 0, y: 110 }, canvasW, canvasH).y; // last button's bottom
const summaryY = buttonBottomY + this.scaleToCanvas({ x: 0, y: 20 }, canvasW, canvasH).y; // add margin

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
 
const logicalTopMargin = 10;
let yOffset = scrollAreaTop - this.scrollOffset + this.scaleToCanvas({ x: 0, y: logicalTopMargin }, canvasW, canvasH).y;

     ctx.font = ctx.font = this.getLogicalFontSize(14, canvasH)
     ctx.fillStyle = '#000';
   
    
      // 🧑‍💼 Responses
      const lineOffsets = [20, 38, 56, 74]; // logical Y offsets within block
      
     
  responses.forEach((entry, i) => {
    const logicalBlockY = (i * (this.logicalBlockHeight + 10)) + logicalTopMargin 
    const scaledY = this.scaleToCanvas({ x: 0, y: logicalBlockY }, canvasW, canvasH).y;
    const scrollOffsetPx = this.scaleToCanvas({ x: 0, y: this.scrollOffset }, canvasW, canvasH).y;
    const blockRect = {
      x: this.scaleToCanvas({ x: 10, y: 0 }, canvasW, canvasH).x,
      y: scaledY - scrollOffsetPx + scrollAreaTop,
      width: this.scaleToCanvas({ x: 980, y: 0 }, canvasW, canvasH).x,
      height: this.scaleToCanvas({ x: 0, y: this.logicalBlockHeight }, canvasW, canvasH).y
    };

    // Skip rendering if block is outside visible scroll area
    if (blockRect.y + blockRect.height < scrollAreaTop || blockRect.y > scrollAreaBottom) {
      return;
    }
    const logicalLineHeight = 14;
    const fontSize = this.getLogicalFontSize(logicalLineHeight, canvasH); // canvas font string
    
    const maxWidth = blockRect.width - 40;
    
    // Measure logical height
    const goodHeight = this.measureWrappedHeight(ctx, `👍 Good: ${entry.good || '—'}`, maxWidth, logicalLineHeight);
const betterHeight = this.measureWrappedHeight(ctx, `💡 Better: ${entry.better || '—'}`, maxWidth, logicalLineHeight);
const learntHeight = this.measureWrappedHeight(ctx, `📘 Learnt: ${entry.learnt || '—'}`, maxWidth, logicalLineHeight);

    
const logicalHeight = lineOffsets[0] + 18 + goodHeight + betterHeight + learntHeight;
const blockHeight = this.scaleToCanvas({ x: 0, y: logicalHeight }, canvasW, canvasH).y;

    
    // ✅ Draw background first
    if (i % 2 === 0) {
      ctx.fillStyle = '#f9f9f9';
      ctx.fillRect(blockRect.x, blockRect.y, blockRect.width, blockHeight);
    }
    
    // ✅ Draw text
    ctx.fillStyle = '#222';
    ctx.font = this.getLogicalFontSize(16, canvasH);
    ctx.fillText(`${i + 1}. ${entry.name || '—'} (${entry.ocupatie || '—'})`, blockRect.x + 10, blockRect.y + this.scaleToCanvas({ x: 0, y: lineOffsets[0] }, canvasW, canvasH).y);
    
    ctx.font = fontSize;
ctx.fillStyle = '#000';

let currentY = blockRect.y + this.scaleToCanvas({ x: 0, y: lineOffsets[0] + 18 }, canvasW, canvasH).y;

currentY = this.wrapText(ctx, `👍 Good: ${entry.good || '—'}`, blockRect.x + 20, currentY, maxWidth, this.scaleToCanvas({ x: 0, y: logicalLineHeight }, canvasW, canvasH).y);
currentY = this.wrapText(ctx, `💡 Better: ${entry.better || '—'}`, blockRect.x + 20, currentY, maxWidth, this.scaleToCanvas({ x: 0, y: logicalLineHeight }, canvasW, canvasH).y);
currentY = this.wrapText(ctx, `📘 Learnt: ${entry.learnt || '—'}`, blockRect.x + 20, currentY, maxWidth, this.scaleToCanvas({ x: 0, y: logicalLineHeight }, canvasW, canvasH).y);

    
    
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

    measureWrappedHeight(ctx, text, maxWidth, logicalLineHeight) {
      const words = text.split(' ');
      let line = '';
      let lines = 0;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          lines++;
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines++; // final line
      return lines * logicalLineHeight; // ✅ still logical units
    }
    
    

    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
      const words = text.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, y);
      return y + lineHeight; // ✅ Return final y position
    }
    
    
  
    drawHitRegion(hitCtx) {
      hitCtx.fillStyle = '#0000ff';
      hitCtx.fillRect(this.ctx.canvas.width - 100, 10, 80, 20);
    }
    getMaxScroll() {
      const totalLogicalHeight = (this.form.responses?.length || 0) * (this.logicalBlockHeight + 10);
      const { visibleLogicalHeight } = this.getScrollMetrics();
      return Math.max(0, totalLogicalHeight - visibleLogicalHeight);
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
        const now = Date.now();
        const twentyMinutesAgo = now - 20 * 60 * 1000;
      
        const recentNamed = (this.form.responses || []).filter(r =>
          r.name && r.timestamp && r.timestamp >= twentyMinutesAgo
        );
      
        const randomEntry = recentNamed[Math.floor(Math.random() * recentNamed.length)];
        this.randomName = randomEntry?.name ?? '—';
        this.render({ ctx: this.ctx });
        return;

        
      }
      
this.scrollVelocity = 0; // stop any ongoing scroll momentum
const down = this.scrollDownButtonBounds;
const up = this.scrollUpButtonBounds;

const clickedDown =
  down && x >= down.x && x <= down.x + down.width &&
  y >= down.y && y <= down.y + down.height;

const clickedUp =
  up && x >= up.x && x <= up.x + up.width &&
  y >= up.y && y <= up.y + up.height;
  const totalLogicalHeight = (this.form.responses?.length || 0) * (this.logicalBlockHeight + 10);

  const { canvasW, canvasH, maxVisibleHeight, visibleLogicalHeight } = this.getScrollMetrics();

  const blockHeightPx = this.scaleToCanvas({ x: 0, y: this.logicalBlockHeight }, canvasW, canvasH).y;

  const maxScroll = this.getMaxScroll();

  if (clickedDown) {
    this.scrollOffset = Math.min(this.scrollOffset + this.scrollStep, maxScroll);
    this.render({ ctx: this.ctx });
    return;
  }
  
  if (clickedUp) {
    this.scrollOffset = Math.max(0, this.scrollOffset - this.scrollStep);
    this.render({ ctx: this.ctx });
    return;
  }
  


    }
    getScrollMetrics() {
      const { width: canvasW, height: canvasH } = this.getCanvasSize();
      const scrollAreaTop = this.scaleToCanvas({ x: 0, y: 200 }, canvasW, canvasH).y;
      const scrollAreaBottom = canvasH - this.scaleToCanvas({ x: 0, y: 40 }, canvasW, canvasH).y;
      const maxVisibleHeight = scrollAreaBottom - scrollAreaTop;
      const visibleLogicalHeight = (maxVisibleHeight / canvasH) * 1000;
      return { canvasW, canvasH, scrollAreaTop, scrollAreaBottom, maxVisibleHeight, visibleLogicalHeight };
    }
    
  
    getHitHex() {
      return 'form-results-001';
    }
  
    getHitColor() {
      return '#0000ff';
    }
  }