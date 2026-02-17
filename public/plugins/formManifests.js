
import { FormLayoutHelper } from "./formLayoutHelper.js";
import { normalizeFields } from "../utils/normalizeFields.js";

export const pluginRegistry = {
    fieldTypes: {},
    registerFieldType(type, factory) {
      this.fieldTypes[type] = factory;
    },
    createField(type, props) {
      return this.fieldTypes[type]?.(props);
    }
  };

  export function normalizeForm(form) {
    const source = Array.isArray(form?.fields)
      ? { fields: form.fields }
      : form?.formStructure;
    const sourceFields = normalizeFields(source);

    const fields = sourceFields.map((field) => {
      if (field?.type === 'button' && !field.action && !field.command) {
        return {
          ...field,
          action: 'form.submit'
        };
      }
      return field;
    });
    return {
      id: form.id || `form-${Date.now()}`,
      label: fields[0].label || 'Untitled Form',
      user: form.user || 'anonymous',
      formStructure: { fields }
    };
  }


export const formManifest = {
    id: 'userSurvey',
    label: 'User Feedback Form',
    mode: 'create', // or 'edit' or 'results'
    layout: {
      title: { x: 20, y: 20, width: 300, height: 40 },
      submit: { x: 400, y: 20, width: 100, height: 40 },
      close: { x: 80, y: 20, width: 15, height: 15 },
      results: { x: 20, y: 90, width: 300, height: 70 }
    },
    fields: [
      {
        id: 'nameInput',
        type: 'input',
        placeholder: 'Your Name',
        layout: { x: 20, y: 80, width: 200, height: 40 },
        editable: true
      },
      {
        id: 'emailInput',
        type: 'input',
        placeholder: 'Email Address',
        layout: { x: 20, y: 130, width: 200, height: 40 },
        editable: true
      },
      {
        id: 'feedbackInput',
        type: 'input',
        placeholder: 'Your Feedback',
        layout: { x: 20, y: 180, width: 300, height: 80 },
        editable: true
      }
    ]
  };

  export const feedbackFormManifest = {
    id: 'feedbackForm',
    label: 'Feedback Form',
    mode: 'create',
    layout: {
      title: { x: 20, y: 20, width: 400, height: 40 },
      submit: { x: 20, y: 400, width: 200, height: 40 }
    },
    fields: [
      {
        id: 'nameInput',
        type: 'input',
        label: 'Your Name',
        layout: { x: 20, y: 80, width: 400, height: 40 },
        editable: true
      },
      {
        id: 'ocupatieInput',
        type: 'input',
        label: 'Your Occupation',
        layout: { x: 20, y: 130, width: 400, height: 40 },
        editable: true
      },
      {
        id: 'goodTextarea',
        type: 'textarea',
        label: 'What went well?',
        layout: { x: 20, y: 180, width: 400, height: 60 },
        editable: true
      },
      {
        id: 'betterTextarea',
        type: 'textarea',
        label: 'What could be better?',
        layout: { x: 20, y: 250, width: 400, height: 60 },
        editable: true
      },
      {
        id: 'learntTextarea',
        type: 'textarea',
        label: 'What did you learn?',
        layout: { x: 20, y: 320, width: 400, height: 60 },
        editable: true
      },
      { id: 'submitButton', 
      type: 'button', 
      label: 'Create', 
      layout: { x: 20, y: 400, width: 200, height: 40 }, 
      editable: false }


    ]
  };

  const helper = new FormLayoutHelper(null, { formWidth: 450, fieldHeight: 50, spacing: 15, startY: 70 });

  const layout = helper.generateLayout([
    { id: 'title', height: 40 },
    { id: 'nameInput' },
    { id: 'ocupatieInput' },
    { id: 'goodTextarea', height: 60 },
    { id: 'betterTextarea', height: 60 },
    { id: 'learntTextarea', height: 60 },
    { id: 'submitButton', width: 200 }
  ]);

  export const discussionFeedbackFormManifest = {
    id: 'discussionFeedbackForm',
    label: 'Discussion Feedback Form',
    mode: 'create',
    layout,
    fields: [
      {
        id: 'title',
        type: 'text',
        label: 'Discussion Feedback Form',
        layout: layout['title'],
        editable: false
      },
      {
        id: 'nameInput',
        type: 'input',
        label: 'Your Name',
        layout: layout['nameInput'],
        editable: true
      },
      {
        id: 'ocupatieInput',
        type: 'input',
        label: 'Your Occupation',
        layout: layout['ocupatieInput'],
        editable: true
      },
      {
        id: 'goodTextarea',
        type: 'textarea',
        label: 'What went well?',
        layout: layout['goodTextarea'],
        editable: true
      },
      {
        id: 'betterTextarea',
        type: 'textarea',
        label: 'What could be better?',
        layout: layout['betterTextarea'],
        editable: true
      },
      {
        id: 'learntTextarea',
        type: 'textarea',
        label: 'What did you learn?',
        layout: layout['learntTextarea'],
        editable: true
      },
      { 
        id: 'submitButton', 
        type: 'button', 
        label: 'Submit Feedback', 
        layout: layout['submitButton'], 
        editable: false 
      }
    ]
  };

  const layout2 = helper.generateLayout([
    { id: 'title', height: 40 },
    { id: 'input-1' },
    { id: 'submit-button', width: 100 }
  ]);

  export const blankFormManifest = {
    id: `form-${Date.now()}`,
    label: 'New Form',
    mode: 'create',
    layout2,
    fields: [
      {
        id: 'title-1',
        type: 'text',
        label: 'Welcome to the New Form',
        layout: layout2['title']
      },
      {
        id: 'input-1',
        type: 'input',
        label: 'Your Name',
        placeholder: 'Enter your name',
        layout: layout2['input-1']
      },
      {
        id: 'submit-button',
        type: 'button',
        label: 'Submit',
        layout: layout2['submit-button']
      }
    ]
  };