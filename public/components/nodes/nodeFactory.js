export class NodeFactory {
    constructor(registry) {
      this.registry = registry;
    }
  
    create(def) {
      const node = new SceneNode({
        id: def.id,
        style: def.style ?? {},
        visible: def.visible ?? true,
  
        layoutStrategy: this.registry.get("layout", def.layout),
        renderStrategy: this.registry.get("render", def.render),
        updateStrategy: this.registry.get("update", def.update),
        hitTestStrategy: this.registry.get("hitTest", def.hitTest),
  
        children: []
      });
  
      if (def.children) {
        for (const childDef of def.children) {
          node.add(this.create(childDef));
        }
      }
  
      return node;
    }
  }