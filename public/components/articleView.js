import { BaseScreen } from "./baseScreen.js";
import { buildArticleEditManifest, buildArticleViewManifest } from "./manifests/articleViewManifest.js";
import { compileUIManifest } from "./uiManifestCompiler.js";

export class articleViewScreen extends BaseScreen{
    constructor({context, dispatcher, eventBusManager, store, factories, commandRegistry, article, mode = 'view', onSave = null}){
        super({id: 'article-view', context, dispatcher, eventBusManager});
        this.context = context;
        this.store = store;
        this.article = article;
        this.mode = mode;
        this.onSave = typeof onSave === 'function' ? onSave : null;
        this.factories = factories;
        this.commandRegistry = commandRegistry;
        this.saveCommand = `${this.id}.save`;
    }
    createRoot(){
         if (this.mode === 'edit') {
            this.commandRegistry.register(this.saveCommand, async ({ fields } = {}) => {
                if (!this.article?.userId || !this.onSave) return;

                const updates = {
                    title: fields?.['article-edit-title'],
                    article: fields?.['article-edit-body'],
                    photo: fields?.['article-edit-photo'],
                    color: fields?.['article-edit-color']
                };

                try {
                    const saved = await this.onSave({ articleId: this.article.userId, updates });
                    if (saved) {
                        this.article = saved;
                    }
                    this.eventBusManager?.emit?.('socketFeedback', {
                        text: 'Article saved ✅',
                        duration: 2200
                    });
                } catch (error) {
                    this.eventBusManager?.emit?.('socketFeedback', {
                        text: `Save failed ❌: ${error?.message || 'Unknown error'}`,
                        duration: 2600
                    });
                }
            });
         }

         const manifest = this.mode === 'edit'
            ? buildArticleEditManifest(this.article, { saveCommand: this.saveCommand })
            : buildArticleViewManifest(this.article);

         const { rootNode, regions } = compileUIManifest(
        manifest,
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
        if (this.mode === 'edit') {
            this.commandRegistry?.unregister?.(this.saveCommand);
        }
    }


}
