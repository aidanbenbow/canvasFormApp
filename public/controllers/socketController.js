// socketController.js
import socket from '../socketClient.js';
import { eventBus } from '../app.js';

socket.on('feedback', ({ text, position, duration }) => {
    console.log('Received feedback:', text, position, duration);
  eventBus.emit('socketFeedback', { text, position, duration });
});

socket.on('studentCount', ({ count }) => {
    console.log('Updated student count:', count);
    eventBus.emit('updateStudentCount', count);
});

export function sendLog(message, data) {
  socket.emit('log', { message, data });
}

export function onMessageResponse(callback) {
  socket.once('messageResponse', callback);
}

export function emitFeedback({ success, error, box }) {
    const text = success ? "Message sent ✅" : `Failed ❌: ${error}`;
    const position = box?.startPosition
    ? {
        x: box.startPosition.x + (success ? 100 : 0),
        y: box.startPosition.y + 180
      }
    : { x: 100, y: 50 }; // fallback position

    const duration = 3000;
  
    eventBus.emit('socketFeedback', { text, position, duration });
  }

  export function saveFormStructure(payload, boxRef = null) {
    socket.emit('saveFormStructure', payload);
  
    socket.once('formSavedResponse', (response) => {
      emitFeedback({
        success: response.success,
        error: response.error,
        box: boxRef
      });
  
      if (response.success) {
        console.log('Form saved successfully:', response);
      } else {
        console.error('Save failed:', response.error);
      }
    });
  }
  