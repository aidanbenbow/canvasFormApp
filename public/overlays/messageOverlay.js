export class MessageOverlay {
    constructor() {
      this.type = 'messageOverlay'; // This is key for registry lookup
      this.messages = [];
      this.liveMessage = null; //

    }
  
    showMessage(text, position = { x: 50, y: 50 }, duration = 2000) {
      this.messages.push({ text, position, timestamp: Date.now(), duration });
    }

    setLiveMessage(getTextFn, position = { x: 50, y: 20 }) {
      this.liveMessage = { getTextFn, position };
    }
    
    render(rendererContext) {
      const { ctx } = rendererContext;
      const now = Date.now();
  
      this.messages = this.messages.filter(msg => now - msg.timestamp < msg.duration);
  
      ctx.font = '16px Arial';
      ctx.fillStyle = 'black';
      this.messages.forEach(msg => {
        ctx.fillText(msg.text, msg.position.x, msg.position.y);
      });

       // Render live message
    if (this.liveMessage) {
      const text = this.liveMessage.getTextFn();
      
      ctx.fillText(text, this.liveMessage.position.x, this.liveMessage.position.y);
    }


    }
  }