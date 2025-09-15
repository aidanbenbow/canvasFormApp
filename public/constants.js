import { TextBoxRenderer } from "./renderers/boxes/textBox.js";
import { InputBoxRenderer } from "./renderers/boxes/inputBox.js";

import { ImageBoxRenderer } from "./renderers/boxes/imageBox.js";

import { MessageOverlayRenderer } from "./renderers/messageOverlay.js";
import { AdminOverlayRenderer } from "./renderers/adminOverlay.js";
import socket from "./socketClient.js";

export const canvasConfig = {
    main: {
        mainId: '#mainCanvas',
        hitId: '#mainHitCanvas',
        bg: 'grey',
        hitBg: 'red',
        width: window.innerWidth,
        height: window.innerHeight - 4,
    },
    overlay: {
        mainId: '#adminOverlayCanvas',
        hitId: '#adminOverlayHitCanvas',
        bg: 'transparent',
        hitBg: 'transparent',
        width: window.innerWidth,
        height: window.innerHeight - 4,
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

  export function createPluginManifest({ eventBus, textEditorController }) {
    return {
      renderers: [
        { id: 'textBox', class: TextBoxRenderer },
        { id: 'inputBox', class: InputBoxRenderer },
        { id: 'imageBox', class: ImageBoxRenderer },
        { id: 'adminOverlay', class: AdminOverlayRenderer }
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
            eventBus.emit('showMessage', {
              text: "No input to send ❌",
              position: {
                x: box.startPosition.x,
                y: box.startPosition.y - 30
              },
              duration: 3000
            });
            return;
          }

          socket.emit('log', { message: box.id, data: dataToSend });
        
          socket.once('messageResponse', (response) => {
            const { success, result, error } = response;
        
            eventBus.emit('showMessage', {
              text: success ? "Message sent ✅" : `Failed ❌: ${error}`,
              position: {
                x: box.startPosition.x + (success ? 300 : 0),
                y: box.startPosition.y - 80
              },
              duration: 3000
            });
        
            if (success) console.log('Message saved:', result);
            else console.error('Error:', error);
          });
        
        
        },
        writeText: (box) => {
          textEditorController.startEditing(box);
       
        }
      }
    };
  }