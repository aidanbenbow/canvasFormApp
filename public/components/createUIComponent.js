import { UIFieldContainer } from "./UiFieldContainer.js";
import { UIInput } from "./UiInput.js";
import { UiText } from "./UiText.js";
import { UIButton } from "./button.js";

import { UIScrollContainer } from "./scrollContainer.js";


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

