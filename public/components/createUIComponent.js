import { UIFieldContainer } from "../legacy/UiFieldContainer.js";
import { UIInput } from "../legacy/UiInput.js";
import { UiText } from "../legacy/UiText.js";
import { UIButton } from "../legacy/button.js";

import { UIScrollContainer } from "../legacy/scrollContainer.js";


const componentRegistry = {
  button: UIButton,
  text: UiText,
  input: UIInput,
  container: UIScrollContainer,
  fieldContainer: UIFieldContainer
};

export function createUIComponent(def, context) {

  const { type, id } = def;
  const ComponentClass = componentRegistry[type];
  if (!ComponentClass) throw new Error(`Unknown component type: ${type}`);
  return new ComponentClass({ id, ...def, context });
}

