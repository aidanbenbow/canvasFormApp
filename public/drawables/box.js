import { utilsRegister } from "../utils/register.js";



        

export class Box {
    constructor({id,type, startPosition, size, text, label, fill, renderer, action, imageKey}) {

        const generateHitHex = utilsRegister.get('hit', 'generateHitHex');
      
        this.id = id;
        this.type = type;
        this.setPosition(startPosition, true);
       // console.log(canvasSize, this.startPosition, this.logicalPosition);
        this.size = size;
        this.text = text;
        this.label = label || 'label'; // Default label for input boxes
        this.fill = fill;
        
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
        
        this.actionKey = action
        this.imageKey = imageKey

    }

    getCentre() {
        return {
            x: this.startPosition.x + this.size.width / 2,
            y: this.startPosition.y + this.size.height / 2
        };
    }

    setPosition(pos, isLogical = true) {
        const getCanvasSize = utilsRegister.get('canvas', 'getCanvasSize');
        const canvasSize = typeof getCanvasSize === 'function'
          ? getCanvasSize()
          : { width: 1000, height: 1000 };
      
        if (isLogical) {
          const scaleToCanvas = utilsRegister.get('layout', 'scaleToCanvas');
          this.logicalPosition = pos;
          this.startPosition = scaleToCanvas(pos, canvasSize.width, canvasSize.height);
        } else {
          const scaleFromCanvas = utilsRegister.get('layout', 'scaleFromCanvas');
          this.startPosition = pos;
          this.logicalPosition = scaleFromCanvas(pos, canvasSize.width, canvasSize.height);
        }
      
        if (this.Gizmo) {
          this.Gizmo.centre = this.getCentre();
        }
      }

    draw(rendererContext) {
        this.renderer.render(this, rendererContext);
        
    }
 

    updateText(newText) {
        this.text = newText;
        if (this.textSizerPlugin) {
            this.textSizerPlugin.onTextUpdate(this, newText);
          }
        
       // this.size = this.textRenderer.measureTextSize(this.text, this.fontSize);
       if (this.Gizmo) {
        this.Gizmo.centre = this.getCentre();
      }
    }

    moveTo(pos) {
        this.startPosition = pos;
       // this.Gizmo.updateCentre(this.getCentre());
    }

    resizeTo(size) {
        this.size = size;
        const minWidth = 150;
this.size.width = Math.max(this.size.width, minWidth);
        const maxWidth = this.size.width * 0.8; // Limit text width to 80% of box width
        this.fontSize = size.height * 0.6;

        if (typeof this.renderer.measureTextSize === 'function') {
          this.size = this.renderer.measureTextSize(this.text, this.fontSize, maxWidth);
        }
      
       // this.Gizmo.updateCentre(this.getCentre());
    }
    serialize() {
        console.log('Serializing box:', this.id, this.type, this.fill, this.imageKey, this.actionKey);

        return {
          type: this.type,
          startPosition: this.logicalPosition,
          size: this.size,
          text: this.text,
          color: this.fill,
          label: this.label,
          editable: this.editable,
          imageKey: this.imageKey || null, // if using assetManager
            action: this.actionKey
        };
      }
}