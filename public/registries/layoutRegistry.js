import { AnchoredOverlayLayoutStrategy } from "../strategies/anchoredOverlay.js";
import { ButtonLayoutStrategy } from "../strategies/buttonLayoutStrategy.js";
import { CenterLayoutStrategy } from "../strategies/centre.js";
import { engineRootLayoutStrategy } from "../strategies/engineRootLayout.js";
import { DropdownLayoutStrategy } from "../strategies/nodeLayouts/dropDownLayout.js";
import { InputLayoutStrategy } from "../strategies/nodeLayouts/inputLayout.js";
import { KeyboardLayoutStrategy } from "../strategies/nodeLayouts/keyBoardLayout.js";
import { PopupLayoutStrategy} from "../strategies/nodeLayouts/popUpLayout.js";
import { RootLayoutStrategy } from "../strategies/nodeLayouts/rootLayout.js";
import { TextLayoutStrategy } from "../strategies/nodeLayouts/textLayout.js";
import { ToastLayoutStrategy } from "../strategies/nodeLayouts/toastLayout.js";
import { overlayLayoutStrategy } from "../strategies/overlayLayout.js";
import { VerticalLayoutStrategy } from "../strategies/vertical.js";
import { HorizontalLayoutStrategy } from "../strategies/horizontal.js";

export const layoutRegistry = {
    vertical: ()=> new VerticalLayoutStrategy(),
    horizontal: ()=> new HorizontalLayoutStrategy(),
    root: ()=> new RootLayoutStrategy(),
    popup: ()=> new PopupLayoutStrategy(),
    keyboard: ()=> new KeyboardLayoutStrategy(),
    input: ()=> new InputLayoutStrategy(),
    text: ()=> new TextLayoutStrategy(),
    button: ()=> new ButtonLayoutStrategy(),
    engine: ()=> new engineRootLayoutStrategy(),
    overlay: ()=> new overlayLayoutStrategy(),
    centre: ()=> new CenterLayoutStrategy(),
    dropDown: ()=> new DropdownLayoutStrategy(),
    anchored: ()=> new AnchoredOverlayLayoutStrategy(),
    toast: ()=> new ToastLayoutStrategy()
}