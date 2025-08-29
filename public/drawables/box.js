import { utilsRegister } from "../utils/register.js";



export class Box {
    constructor(id,type, startPosition, size, text, fill, renderer, action = null) {
        this.id = id;
        this.type = type;
        this.id = `${Date.now()}`; // Unique ID based on type and timestamp
        this.startPosition = startPosition;
        this.size = size;
        this.text = text;
        this.label = 'label'; // Default label for input boxes
        this.fill = fill;
        const generateHitHex = utilsRegister.get('hit', 'generateHitHex');
        this.hitColors = {
            main: generateHitHex(`${type}-main-${this.id}`),
            ...(type === 'inputBox' && {
                label: generateHitHex(`${type}-label-${this.id}`),
                text: generateHitHex(`${type}-text-${this.id}`)
            }),
            ...(type === 'imageBox' && {
                image: generateHitHex(`${type}-image-${this.id}`)
            }),
            ...(type === 'textBox' && {
                icon0: generateHitHex(`${type}-icon0-${this.id}`),
                icon1: generateHitHex(`${type}-icon1-${this.id}`)
              })
        
        };
       
        this.fontSize = size.height * 0.6;
        this.select = false

        this.renderer = renderer;
        this.textRenderer = this.renderer.registry.get('textBox');
        this.action = action
        this.actionKey = null; // Action key for image boxes
    }

    getCentre() {
        return {
            x: this.startPosition.x + this.size.width / 2,
            y: this.startPosition.y + this.size.height / 2
        };
    }

    draw(rendererContext) {
        this.renderer.render(this, rendererContext);
        
    }

    updateText(newText) {
        this.text = newText;
        
        this.size = this.textRenderer.measureTextSize(this.text, this.fontSize);
        this.Gizmo.centre = this.getCentre();
    }

    moveTo(pos) {
        this.startPosition = pos;
        this.Gizmo.updateCentre(this.getCentre());
    }

    resizeTo(size) {
        this.size = size;
        const maxWidth = this.size.width * 0.8; // Limit text width to 80% of box width
        this.fontSize = size.height * 0.6;

        if (typeof this.renderer.measureTextSize === 'function') {
          this.size = this.renderer.measureTextSize(this.text, this.fontSize, maxWidth);
        }
      
        this.Gizmo.updateCentre(this.getCentre());
    }
    serialize() {
       
        return {
          type: this.type,
          startPosition: this.startPosition,
          size: this.size,
          text: this.text,
          color: this.fill,
          label: this.label,
          editable: this.editable,
          imageKey: this.image?.key || null, // if using assetManager
            action: this.actionKey
        };
      }
}