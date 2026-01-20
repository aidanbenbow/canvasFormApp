import { keyboardLayoutStrategy } from "../strategies/nodeLayouts/keyBoardLayout.js";
import { popupLayoutStrategy } from "../strategies/nodeLayouts/popUpLayout.js";
import { RootLayoutStrategy } from "../strategies/nodeLayouts/rootLayout.js";
import { VerticalLayoutStrategy } from "../strategies/vertical.js";

export const layoutRegistry = {
    vertical: ()=> new VerticalLayoutStrategy(),
    root: ()=> new RootLayoutStrategy(),
    popup: ()=> popupLayoutStrategy,
    keyboard: ()=> keyboardLayoutStrategy
}