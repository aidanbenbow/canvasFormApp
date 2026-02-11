export const ACTIONS = {
    DASHBOARD: {
        SHOW: 'dashboard:show',
        FORM_SELECTED: 'dashboard:form_selected',
        CREATE: 'dashboard:create',
    },
    ARTICLE: {
        VIEW: 'article:view',
        CREATE: 'article:create',
        EDIT: 'article:edit',
        DELETE: 'article:delete',
        SET_ACTIVE: 'article:set_active',
        SET_LIST: 'article:set_list',
        ADD: 'article:add',
        UPDATE: 'article:update',
    },
    FORM: {
        VIEW: 'form:view',
        SUBMIT: 'form:submit',
        CREATE: 'form:create',
        EDIT: 'form:edit',
        DELETE: 'form:delete',
        RESULTS: 'form:results',
        SET_ACTIVE: 'form:set_active',
        SET_LIST: 'form:set_list',
        RESULTS_SET: 'form:results_set',
        ADD_RESULTS: 'form:add_results',
        UPDATE: 'form:update',
        ADD: 'form:add',
    },
    STORE: {
        FORM_FORMS: 'STORE/FORM/FORMS',
        FORM_ACTIVE: 'STORE/FORM/ACTIVE',
    },
    KEYBOARD: {
        SHOW: 'keyboard:show',
        HIDE: 'keyboard:hide',
        PRESS: 'keyboard:press',
        SUBMIT: 'keyboard:submit',
    },
    UI: {
        FOCUS: 'ui:focus',
        BLUR: 'ui:blur',
    
        POINTER_ENTER: 'ui:pointer_enter',
        POINTER_LEAVE: 'ui:pointer_leave',
    
        POINTER_DOWN: 'ui:pointer_down',
        POINTER_UP: 'ui:pointer_up',
      },
      DROPDOWN: {
        SHOW: 'dropdown:show',
        HIDE: 'dropdown:hide',
        SELECT: 'dropdown:select',  // optional, for selecting an option
      },
      POPUP: {
        SHOW: 'popup:show',
        HIDE: 'popup:hide',
      },
      TOAST: {
        SHOW: 'toast:show',
        HIDE: 'toast:hide',
      },
};