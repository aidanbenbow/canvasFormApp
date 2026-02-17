import { BaseScreen } from "./baseScreen.js";
import { buildArticleViewManifest } from "./manifests/articleViewManifest.js";
import { compileUIManifest } from "./uiManifestCompiler.js";

export class articleViewScreen extends BaseScreen{
    constructor({context, dispatcher, eventBusManager, store, factories, commandRegistry, article}){
        super({id: 'article-view', context, dispatcher, eventBusManager});
        this.context = context;
        this.store = store;
        this.article = article;
        this.manifest = buildArticleViewManifest(this.article);
        this.factories = factories;
        this.commandRegistry = commandRegistry;
    }
    createRoot(){
         const { rootNode, regions } = compileUIManifest(
        this.manifest,
        this.factories,
        this.commandRegistry,
        this.context
        );
        this.rootNode = rootNode;
        this.regions = regions;

   
        return rootNode;

    }
    onEnter(){

    }
    onExit(){

    }


}
