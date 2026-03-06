import { ACTIONS } from '../../events/actions.js';
import { ROUTES } from '../../routes/routeNames.js';

export function registerDashboardEvents({ dispatcher, context, router, commandRegistry }) {
  dispatcher.on(ACTIONS.DASHBOARD.SHOW, (forms) => {
    if (context?.textEditorController?.activeNode) {
      context.textEditorController.stopEditing();
    }

    commandRegistry.execute('form.state.setList', { forms });
    router.replace(ROUTES.dashboard);
  }, 'wiring.dashboard');
}