export class AdminOverlayRenderer {
    render(drawable, rendererContext) {
       
      drawable.render(rendererContext); // Delegate to the drawable’s own logic
    }
  
    clear(rendererContext) {
      // Optional: clear overlay layer if needed
    }
  }