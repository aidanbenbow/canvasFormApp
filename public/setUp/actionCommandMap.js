import { ACTIONS } from '../events/actions.js';

export const ACTION_COMMAND_MAP = {
  [ACTIONS.FORM.UPDATE]: 'form.state.update',
  [ACTIONS.FORM.SET_ACTIVE]: 'form.state.setActive',
  [ACTIONS.FORM.SET_LIST]: 'form.state.setList'
};