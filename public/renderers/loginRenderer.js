
export class LoginRenderer {
    render(drawable, rendererContext) {
        const {loginCtx} = rendererContext;
        
      drawable.render({ctx:loginCtx}); // Delegate to the drawable’s own logic
    }
  
    clear(rendererContext) {
      // Optional: clear overlay layer if needed
    }
  }