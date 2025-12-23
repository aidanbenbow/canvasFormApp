import { SceneNode } from "./sceneNode.js";

export class TextNode extends SceneNode{
    constructor({id, text="", style={}, layoutStrategy=null}) {
        super({id, layoutStrategy});
        this.text = text;
        this.style = style;
    }
}