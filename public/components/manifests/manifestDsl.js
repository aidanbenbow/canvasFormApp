export function inputNode({ id, placeholder, inputType = 'text', style } = {}) {
  return {
    type: 'input',
    ...(id ? { id } : {}),
    ...(placeholder !== undefined ? { placeholder } : {}),
    ...(inputType ? { inputType } : {}),
    ...(style ? { style } : {})
  };
}
export function defineManifest({
  layout,
  id,
  style = {},
  commands,
  regions = {}
} = {}) {
  return {
    layout,
    id,
    style,
    ...(commands ? { commands } : {}),
    regions
  };
}

export function containerRegion({
  layout,
  style,
  children = [],
  scrollable,
  viewport
} = {}) {
  return {
    type: 'container',
    ...(layout ? { layout } : {}),
    ...(style ? { style } : {}),
    ...(scrollable !== undefined ? { scrollable } : {}),
    ...(viewport !== undefined ? { viewport } : {}),
    children
  };
}

export function fieldContainerRegion({ children = [] } = {}) {
  return {
    type: 'fieldContainer',
    children
  };
}

export function buttonNode({
  id,
  label,
  action,
  command,
  style,
  skipCollect,
  skipClear,
  payload
} = {}) {
  return {
    type: 'button',
    ...(id ? { id } : {}),
    ...(label !== undefined ? { label } : {}),
    ...(action ? { action } : {}),
    ...(command ? { command } : {}),
    ...(style ? { style } : {}),
    ...(payload ? { payload } : {}),
    ...(skipCollect !== undefined ? { skipCollect } : {}),
    ...(skipClear !== undefined ? { skipClear } : {})
  };
}

export function textNode({ id, text, runs, style } = {}) {
  return {
    type: 'text',
    ...(id ? { id } : {}),
    ...(text !== undefined ? { text } : {}),
    ...(runs ? { runs } : {}),
    ...(style ? { style } : {})
  };
}