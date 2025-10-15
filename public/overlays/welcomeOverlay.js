export class WelcomeOverlay {
    constructor({ ctx }) {
      this.ctx = ctx;
      this.type = 'loginPlugin';
      this.isOverlay = true;
    }
  
    render() {
        const ctx = this.ctx;
      ctx.save();
      ctx.fillStyle = '#222';
      ctx.font = '32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Welcome to Moldovan Musings ✨', window.innerWidth / 2, 150);
      ctx.font = '20px sans-serif';
      ctx.fillText('Please log in to continue', window.innerWidth / 2, 200);
      ctx.restore();
    }
  }
  