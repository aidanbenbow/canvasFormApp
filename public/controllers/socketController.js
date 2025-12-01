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


  export function onDelete(payload, boxRef = null) {
    socket.emit('deleteTheForm',  payload);
  console.log('[SOCKET] Emitting deleteForm for:', payload);
    socket.on('formDeletedResponse', (response) => {
      emitFeedback({
        success: response.success,
        error: response.error,
        box: boxRef
      });
  
      if (response.success) {
        console.log('Form deleted successfully:', response);
      } else {
        console.error('Delete failed:', response.error);
      }
    });
  }

  export function loadFormStructure(formId, callback) {
    console.log('[SOCKET] Emitting loadFormStructure for:', formId);
  
    socket.emit('loadFormStructure', { formId });
  
    socket.once('formStructureData', (data) => {
      console.log('[SOCKET] Received formStructureData:', data);
      callback(data);
    });
  }

  // controllers/socketController.js
  export function fetchAllForms(user) {
    return new Promise((resolve, reject) => {
      socket.emit('getAllForms', { user });
  
      socket.once('allFormsData', (data) => {
        if (data.error) reject(data.error);
        else resolve(data);
      });
    });
  }
  
export function fetchFormResults(formId, tableName = 'faithandbelief') {
 
  return new Promise((resolve, reject) => {
    socket.emit('getFormResults', { formId, tableName });

    socket.once('formResultsData', ({ formId, results }) => {
      console.log('[SOCKET] Received formResultsData:', results);
      resolve(results);
    });

    // Optional: add timeout or error handling
  });
}

export function fetchFormById(formId) {
  return new Promise((resolve, reject) => {
    socket.emit('getFormById', { formId });

    socket.once('formDataById', ({ formId, formData, error }) => {
      if (error) reject(error);
      else resolve(formData);
    });
  });
}


socket.on('formResultsUpdated', ({ formId, results }) => {
  console.log('[SOCKET] Live update for form:', formId);
  eventBus.emit('formResultsUpdated', { formId, results });
});
