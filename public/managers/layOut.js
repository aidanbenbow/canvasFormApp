export class LayoutManager {
    constructor({ logicalWidth = 1000, logicalHeight = 1000 }={}) {
      this.logicalWidth = logicalWidth;
      this.logicalHeight = logicalHeight;
      this.registry = new Map(); // Stores layout entries by ID
      this.zones = new Map();    // Optional named zones
    }
  
    // Define a layout zone
    defineZone(name, bounds) {
      this.zones.set(name, bounds);
    }
  
    // Place an item with logical coordinates and optional alignment
    place({ id, x, y, width, height, anchor = 'top-left', offset = { x: 0, y: 0 },parent = null, }) {
      const base = { x, y, width, height, parent };
  
      // Apply anchor logic
      if (anchor === 'center') {
        base.x -= width / 2;
        base.y -= height / 2;
      } else if (anchor === 'bottom-right') {
        base.x -= width;
        base.y -= height;
      }
  
      // Apply offset
      base.x += offset.x;
      base.y += offset.y;
  
      this.registry.set(id, base);

    }
  
    // Place relative to another item
    placeRelative({ id, relativeTo, position = 'below', margin = 10, width, height }) {
      const ref = this.registry.get(relativeTo);
      if (!ref) throw new Error(`Missing reference: ${relativeTo}`);
  
      let x = ref.x;
      let y = ref.y;
  
      switch (position) {
        case 'below':
          y = ref.y + ref.height + margin;
          break;
        case 'right':
          x = ref.x + ref.width + margin;
          break;
        case 'above':
          y = ref.y - height - margin;
          break;
        case 'left':
          x = ref.x - width - margin;
          break;
      }
  
      this.place({ id, x, y, width, height });
    }
  
    // Flow layout for multiple items
    flow({ direction = 'vertical', items, spacing = 10, anchor = 'top-left', start = { x: 0, y: 0 }, size }) {
      let cursor = { ...start };
  
      for (const id of items) {
    
        this.place({ id, x: cursor.x, y: cursor.y, width: size.width, height: size.height, anchor });
        if (direction === 'vertical') {
          cursor.y += size.height + spacing;
        } else {
          cursor.x += size.width + spacing;
        }
      }
    }
  
    // Get scaled bounds for rendering
    getScaledBounds(id, canvasWidth, canvasHeight) {
      const item = this.registry.get(id);
      if (!item) return null;
    
      let x = item.x;
      let y = item.y;
  
      // Apply parent offset if defined
      if (item.parent) {
        const parent = this.registry.get(item.parent);
        if (parent) {
          x += parent.x;
          y += parent.y;
        }
      }
  
      return {
        x: (x / this.logicalWidth) * canvasWidth,
        y: (y / this.logicalHeight) * canvasHeight,
        width: (item.width / this.logicalWidth) * canvasWidth,
        height: (item.height / this.logicalHeight) * canvasHeight
      };
    }
    getLogicalBounds(id) {
 
      return this.registry.get(id) || null;
    }
    setLogicalBounds(id, bounds) {
      if (this.registry.has(id)) {
        this.registry.set(id, { ...this.registry.get(id), ...bounds });
      } else {
        this.registry.set(id, bounds);
      }
    }


    dumpRegistry() {
      console.log('📦 Layout Registry Dump:');
      for (const [id, bounds] of this.registry.entries()) {
        console.log(`- ${id}: x=${bounds.x}, y=${bounds.y}, w=${bounds.width}, h=${bounds.height}, parent=${bounds.parent || 'none'}`);
      }
    }
    
  }
  