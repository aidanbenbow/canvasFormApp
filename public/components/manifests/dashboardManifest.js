import { ACTIONS } from '../../events/actions.js';
import {
  buttonNode,
  containerRegion,
  defineManifest,
  fieldContainerRegion
} from './manifestDsl.js';

const toolbarButtonStyle = { fillWidth: false, font: '20px sans-serif', paddingX: 14, paddingY: 8 };

export const dashboardUIManifest = defineManifest({
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
    toolbar: containerRegion({
      layout: 'horizontal',
      style: {
        background: '#f3f4f6',
        border: { color: '#d1d5db', width: 1 }
      },
      children: [
        buttonNode({ id: 'view', label: 'View', command: 'FORM_VIEW', style: toolbarButtonStyle }),
        buttonNode({ id: 'results', label: 'Results', command: 'FORM_RESULTS', style: toolbarButtonStyle }),
        buttonNode({ id: 'create', label: 'Create', command: 'FORM_CREATE', style: toolbarButtonStyle }),
        buttonNode({ id: 'edit', label: 'Edit', command: 'FORM_EDIT', style: toolbarButtonStyle }),
        buttonNode({ id: 'delete', label: 'Delete', command: 'FORM_DELETE', style: toolbarButtonStyle })
      ]
    }),
    forms: fieldContainerRegion({ children: [] })
  }
});

export function buildDashboardManifest() {
  return structuredClone(dashboardUIManifest);
}