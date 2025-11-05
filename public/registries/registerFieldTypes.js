
import { UIButton } from '../components/button.js';
import { UIInputBox } from '../components/inputBox.js';
import { UITextArea } from '../components/textArea.js';

import { pluginRegistry } from '../plugins/formManifests.js';

export function registerFieldTypes() {
  pluginRegistry.registerFieldType('input', ({ id, layout, placeholder, onChange, editorController }) => {
    return new UIInputBox({ id, layout, editorController, placeholder, onChange });
  });

  pluginRegistry.registerFieldType('textarea', ({ id, layout,editorController, placeholder, onChange, autoResize,  }) => {
    return new UITextArea({ id, layout,editorController,placeholder, onChange, autoResize,  });
  });

  pluginRegistry.registerFieldType('button', ({ id, layout, label, onClick }) => {
    return new UIButton({ id, label, layout, onClick });
  });


  // Add more field types here as needed
}