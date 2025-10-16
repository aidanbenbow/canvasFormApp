import { utilsRegister } from "../utils/register.js";

export class WelcomeOverlay {
    constructor({ ctx, layoutManager }) {
      this.ctx = ctx;
      this.canvasWidth = this.ctx.canvas.width;
        this.canvasHeight = this.ctx.canvas.height;
      this.type = 'loginPlugin';
      this.isOverlay = true;
      this.layoutManager = layoutManager;
      layoutManager.place({
        id: 'welcomeTitle',
        x: 400,
        y: 200,
        width: 600,
        height: 50,
        anchor: 'center'
      });
    
      layoutManager.place({
        id: 'welcomeSubtitle',
        x: 400,
        y: 240,
        width: 600,
        height: 40,
        anchor: 'center'
      });

   
    }
  
    render() {
        const getLogicalFontSize = utilsRegister.get('layout', 'getLogicalFontSize');
        const titleBounds = this.layoutManager.getScaledBounds('welcomeTitle', this.canvasWidth, this.canvasHeight);
        const subtitleBounds = this.layoutManager.getScaledBounds('welcomeSubtitle', this.canvasWidth, this.canvasHeight);


      this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.ctx.fillStyle = 'white';
        this.ctx.font = `${getLogicalFontSize(34, this.canvasHeight)}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Welcome to the Collaborative Editor', titleBounds.x + titleBounds.width / 2, titleBounds.y + 30);

  this.ctx.font = `${getLogicalFontSize(26, this.canvasHeight)}px Arial`;
  this.ctx.fillText('Please log in to continue', subtitleBounds.x + subtitleBounds.width / 2, subtitleBounds.y + 25);
  this.ctx.restore();
    }
  }
  