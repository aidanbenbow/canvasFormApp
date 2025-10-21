export class UiInputBoxRenderer {
    render(drawable, context) {
      drawable.render(); // ✅ Calls the component’s own render method
     
    }
  
    clear(context) {
      // Optional: if you want to clear only input boxes
    }
  }
  