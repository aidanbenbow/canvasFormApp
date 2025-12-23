import { VerticalLayoutStrategy } from "../strategies/vertical.js";

export const layoutRegistry = {
    vertical: ()=> new VerticalLayoutStrategy(),
}