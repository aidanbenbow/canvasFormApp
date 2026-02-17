import { ACTIONS } from '../../events/actions.js';

const toolbarButtonStyle = { fillWidth: false, font: '20px sans-serif', paddingX: 14, paddingY: 8 };

export const dashboardUIManifest = {
  layout: 'vertical',
  id: 'dashboard-root',
  style: {
    background: '#ffffff'
  },
  commands: {
    FORM_VIEW: {
      action: ACTIONS.FORM.VIEW,
      needsActive: true
    },
    FORM_RESULTS: {
      action: ACTIONS.FORM.RESULTS,
      needsActive: true
    },
    FORM_CREATE: {
      action: ACTIONS.FORM.CREATE,
      needsActive: false
    },
    FORM_EDIT: {
      action: ACTIONS.FORM.EDIT,
      needsActive: true
    },
    FORM_DELETE: {
      action: ACTIONS.FORM.DELETE,
      needsActive: true
    }
  },
  regions: {
    toolbar: {
      type: 'container',
      layout: 'horizontal',
      style: {
        background: '#f3f4f6',
        border: { color: '#d1d5db', width: 1 }
      },
      children: [
        { type: 'button', id: 'view', label: 'View', command: 'FORM_VIEW', style: toolbarButtonStyle },
        { type: 'button', id: 'results', label: 'Results', command: 'FORM_RESULTS', style: toolbarButtonStyle },
        { type: 'button', id: 'create', label: 'Create', command: 'FORM_CREATE', style: toolbarButtonStyle },
        { type: 'button', id: 'edit', label: 'Edit', command: 'FORM_EDIT', style: toolbarButtonStyle },
        { type: 'button', id: 'delete', label: 'Delete', command: 'FORM_DELETE', style: toolbarButtonStyle }
      ]
    },
    forms: {
      type: 'fieldContainer',
      children: []
    }
  }
};

export function buildDashboardManifest() {
  return structuredClone(dashboardUIManifest);
}