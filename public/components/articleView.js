import { BaseScreen } from "./baseScreen.js";
import { compileUIManifest } from "./uiManifestCompiler.js";

const articleManifest = {
    layout: 'centre',
    id: 'article-view-root',
    style: {
        background: '#ffffff'
    },regions: {
        formContainer: {
          type: "container",
          style: {
            background: "#f9f9f9",
          },
          children: [
            { type: "label", id: "title", text: "" },
            { type: "text", id: "article", text: "Repor" }, 
        ],
            scrollable: true,
            viewport: 400
        }
      }
    
}

export class articleViewScreen extends BaseScreen{
    constructor({context, dispatcher, eventBusManager, store, factories, commandRegistry, article}){
        super({id: 'article-view', context, dispatcher, eventBusManager});
        this.context = context;
        this.store = store;
        this.article = article;
        this.manifest = articleManifest;
        this.factories = factories;
        this.commandRegistry = commandRegistry;
        this.createManifest();
    }
    createManifest(){
        this.manifest.regions.formContainer.children = [
            { type: "label", id: "title", text: this.article.title },
            { type: "text", id: "article", text: this.article.article }, 
        ];
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