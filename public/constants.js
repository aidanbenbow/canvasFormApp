import { TextBoxRenderer } from "./renderers/boxes/textBox.js";
import { InputBoxRenderer } from "./renderers/boxes/inputBox.js";

import { ImageBoxRenderer } from "./renderers/boxes/imageBox.js";

import { MessageOverlayRenderer } from "./renderers/messageOverlay.js";
import { AdminOverlayRenderer } from "./renderers/adminOverlay.js";

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
          const editedBox = textEditorController.activeBox;
        
          if (editedBox?.type !== 'inputBox') {
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
        
          const message = editedBox.text?.trim();
          if (!message) return;
        
          try {
            const response = await fetch('/messages', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: editedBox.id,
                message,
                label: editedBox.label || 'Untitled'
              })
            
            });
        
            const result = await response.json();
            console.log('Message saved:', result);
        
            eventBus.emit('showMessage', {
              text: `Message sent: ${message}`,
              position: {
                x: box.startPosition.x + 300,
                y: box.startPosition.y - 80
              },
              duration: 3000
            });
        
            console.log(`Message sent from inputBox ${editedBox.id}: "${message}"`);
          } catch (error) {
            console.error('Error sending message:', error);
            eventBus.emit('showMessage', {
              text: "Failed to send message ❌",
              position: {
                x: box.startPosition.x,
                y: box.startPosition.y - 30
              },
              duration: 3000
            });
          }
        },
        writeText: (box) => {
          textEditorController.startEditing(box);
          console.log(`Box ${box.id} text editing started`);
        }
      }
    };
  }