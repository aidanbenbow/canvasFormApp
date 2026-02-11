import { ToastNode } from "../components/nodes/toastNode.js";
import { ACTIONS } from "../events/actions.js";

export const ToastModule = {
  create(dispatcher) {
    const toast = new ToastNode({
      id: "toast-layer",
      spacing: 10,
      marginBottom: 40
    });

    dispatcher.on(ACTIONS.TOAST?.SHOW, (node) => {
      toast.showMessage(node, { timeoutMs: 3000 });
    });

    return toast;
  }
};
