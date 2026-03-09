import { buttonNode } from './manifestDsl.js';
import { getCompactToolbarButtonStyle } from './screenManifestUtils.js';

export function buildToolbar(buttons = [], pluginButtons = []) {
  const style = getCompactToolbarButtonStyle();

  return [...buttons, ...pluginButtons]
    .filter(Boolean)
    .filter(isValidToolbarButton)
    .map((btn) => buttonNode({
      id: btn.id,
      label: btn.label,
      action: btn.action,
      style: btn.style || style,
      skipCollect: true,
      skipClear: true
    }));
}

function isValidToolbarButton(button) {
  if (!button || typeof button !== 'object') return false;

  const id = String(button.id || '').trim();
  const label = String(button.label || '').trim();
  const action = String(button.action || '').trim();

  return Boolean(id && label && action);
}
