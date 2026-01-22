import { ButtonLayoutStrategy } from "../strategies/buttonLayoutStrategy.js";
import { engineRootLayoutStrategy } from "../strategies/engineRootLayout.js";
import { InputLayoutStrategy } from "../strategies/nodeLayouts/inputLayout.js";
import { keyboardLayoutStrategy } from "../strategies/nodeLayouts/keyBoardLayout.js";
import { PopupLayoutStrategy} from "../strategies/nodeLayouts/popUpLayout.js";
import { RootLayoutStrategy } from "../strategies/nodeLayouts/rootLayout.js";
import { TextLayoutStrategy } from "../strategies/nodeLayouts/textLayout.js";
import { overlayLayoutStrategy } from "../strategies/overlayLayout.js";
import { VerticalLayoutStrategy } from "../strategies/vertical.js";

export const layoutRegistry = {
    vertical: ()=> new VerticalLayoutStrategy(),
    root: ()=> new RootLayoutStrategy(),
    popup: ()=> new PopupLayoutStrategy(),
    keyboard: ()=> new keyboardLayoutStrategy(),
    input: ()=> new InputLayoutStrategy(),
    text: ()=> new TextLayoutStrategy(),
    button: ()=> new ButtonLayoutStrategy(),
    engine: ()=> new engineRootLayoutStrategy(),
    overlay: ()=> new overlayLayoutStrategy()
}