import { RootLayoutStrategy } from "../strategies/nodeLayouts/rootLayout.js";
import { VerticalLayoutStrategy } from "../strategies/vertical.js";

export const layoutRegistry = {
    vertical: ()=> new VerticalLayoutStrategy(),
    root: ()=> new RootLayoutStrategy()
}