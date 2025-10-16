import { TextBoxRenderer } from "./renderers/boxes/textBox.js";
import { InputBoxRenderer } from "./renderers/boxes/inputBox.js";

import { ImageBoxRenderer } from "./renderers/boxes/imageBox.js";

import { MessageOverlayRenderer } from "./renderers/messageOverlay.js";
import { AdminOverlayRenderer } from "./renderers/adminOverlay.js";

import { emitFeedback, onMessageResponse, sendLog } from "./controllers/socketController.js";
import { LoginRenderer } from "./renderers/loginRenderer.js";
import { LayoutRenderer } from "./renderers/layOutRenderer.js";


export const canvasConfig = {
    main: {
        mainId: '#mainCanvas',
        hitId: '#mainHitCanvas',
        bg: 'grey',
        hitBg: 'red',
    },
    overlay: {
        mainId: '#adminOverlayCanvas',
        hitId: '#adminOverlayHitCanvas',
        bg: 'transparent',
        hitBg: 'transparent',
    }
}

export const myPluginManifest = {
    renderers: [
      {
        id: 'textBox',
        class: TextBoxRenderer
      },
      {
        id: 'inputBox',
        class: InputBoxRenderer
      },
      {
        id: "imageBox",
        class: ImageBoxRenderer
      }
    ],
    images: {
      "button-unpushed": "/images/button_unpushed.png",
      "checkbox-tick": "/images/checkbox_tick.png"
    },
    actions: {
      openImageModal: (box) => {
        console.log(`Opening modal for imageKey: ${box.imageKey}`);
        // You could trigger a modal, zoom, or any UI interaction here
      },
      highlightBox: (box) => {
        box.highlighted = true;
        console.log(`Box ${box.id} highlighted`);
      },
      sendButton: (box) => {
        system.eventBus.emit('showMessage', {
          text: "Message sent ✅",
          position: { x: box.startPosition.x, y: box.startPosition.y - 30 },
          duration: 3000
        });
      },
      writeText: (box) => {
        
        console.log(`Box ${box.id} text updated to: hi`);
      }
    
    }
  
  
  };

  export function createPluginManifest({ eventBus, textEditorController, layoutManager, canvas }) {
    return {
      renderers: [
        { id: 'textBox', class: TextBoxRenderer },
        { id: 'inputBox', class: InputBoxRenderer },
        { id: 'imageBox', class: ImageBoxRenderer },
        { id: 'adminOverlay', class: AdminOverlayRenderer },
        { id: 'loginPlugin', class: LoginRenderer },
        {
          id: 'layout',
          factory: () => new LayoutRenderer(layoutManager, canvas)
        }
      ],
      images: {
        "button-unpushed": "/images/button_unpushed.png",
        "checkbox-tick": "/images/checkbox_tick.png"
      },
      actions: {
        openImageModal: (box) => {
          console.log(`Opening modal for imageKey: ${box.imageKey}`);
        },
        highlightBox: (box) => {
          box.highlighted = true;
          console.log(`Box ${box.id} highlighted`);
        },
        sendButton: async (box) => {
          const allBoxes = textEditorController.getAllBoxes();

          const inputData = allBoxes.filter(b => b.type === 'inputBox').map(b => ({
            label: b.label || 'Untitled',
            text: b.text?.trim() || ''
          }));

          const dataToSend = inputData.reduce((acc, entry) => {
            acc[entry.label] = entry.text;
            return acc;
          }, {});
          


          if (inputData.length === 0) {
            console.warn("No inputBox is currently being edited.");
            socket.emit('feedback', {
              success: false,
              text: "No input to send ❌",
              position: {
                x: box.startPosition.x,
                y: box.startPosition.y - 30
              }
        ,
              duration: 3000
            });
            return;
          }

         sendLog(box.id, dataToSend);
        
         onMessageResponse((response) => {
          emitFeedback({
            success: response.success,
            error: response.error,
            box
          });
        
          if (response.success) {
            allBoxes.forEach(b => {
              if (b.type === 'inputBox') {
                b.text = '';
              }
            });
            textEditorController.stopEditing();
          }
        });
        
        
        
        },
        writeText: (box) => {
          textEditorController.startEditing(box);
       
        }
      }
    };
  }