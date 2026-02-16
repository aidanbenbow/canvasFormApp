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
                        { type: "text", id: "article", text: "" },
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
        this.manifest = structuredClone(articleManifest);
        this.factories = factories;
        this.commandRegistry = commandRegistry;
        this.createManifest();
    }
    createManifest(){
        const runs = buildArticleRuns(this.article);
                const children = [];

                const photoSrc =
                    this.article?.photo ||
                    this.article?.image ||
                    this.article?.imageUrl ||
                    this.article?.photoUrl ||
                    null;

                if (photoSrc) {
                    children.push({
                        type: 'photo',
                        id: 'article-photo',
                        src: photoSrc,
                        style: {
                            width: isSmallScreen() ? 900 : 860,
                            height: isSmallScreen() ? 420 : 320,
                            radius: 10
                        }
                    });
                }

                children.push({
                    type: "text",
                    id: "article",
                    runs,
                    style: { color: this.article.style?.color }
                });

                this.manifest.regions.formContainer.children = children;
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

function buildArticleRuns(article) {
    const defaultBodyColor = article?.style?.color || "#111827";
    const defaultBodyFont = "24px 'Segoe UI'";
    const normalizedRuns = normalizeArticleRuns(article?.runs, {
        font: defaultBodyFont,
        color: defaultBodyColor
    });

    if (normalizedRuns.length > 0) {
        return normalizedRuns;
    }

    const title = article?.title ? `${article.title}\n` : "";
    const body = article?.article ?? "";

    const titleFont = "40px 'Segoe UI Semibold'";
    const headingFont = "32px 'Segoe UI Semibold'";
    const bodyFont = "24px 'Segoe UI'";
    const boldFont = "24px 'Segoe UI Semibold'";
    const titleColor = "#0f172a";
    const bodyColor = article?.style?.color || "#111827";

    const runs = [];

    if (title) {
        runs.push({ text: title, font: titleFont, color: titleColor });
    }

    if (body) {
        runs.push(...parseMarkdownToRuns(body, {
            titleFont,
            headingFont,
            bodyFont,
            boldFont,
            titleColor,
            bodyColor
        }));
    }

    return runs;
}

function normalizeArticleRuns(runs, defaults) {
    if (!Array.isArray(runs)) return [];

    const normalized = runs
        .map((run) => {
            if (!run || run.text === undefined || run.text === null) return null;

            const text = String(run.text);
            if (!text.length) return null;

            return {
                text,
                font: run.font || defaults.font,
                color: run.color || defaults.color
            };
        })
        .filter(Boolean);

    return normalized;
}

function parseBoldMarkdownToRuns(text, { font, boldFont, color }) {
    const runs = [];
    const parts = text.split("**");
    let isBold = false;

    for (const part of parts) {
        if (!part) {
            isBold = !isBold;
            continue;
        }
        runs.push({
            text: part,
            font: isBold ? boldFont : font,
            color
        });
        isBold = !isBold;
    }

    return runs;
}

function parseMarkdownToRuns(text, { titleFont, headingFont, bodyFont, boldFont, titleColor, bodyColor }) {
    const runs = [];
    const lines = text.split("\n");

    lines.forEach((line, index) => {
        let lineFont = bodyFont;
        let lineColor = bodyColor;
        let content = line;

        const match = line.match(/^(#{1,2})\s*(.*)$/);
        if (match) {
            const level = match[1].length;
            content = match[2];
            if (level === 1) {
                lineFont = titleFont;
                lineColor = titleColor;
            } else if (level === 2) {
                lineFont = headingFont;
                lineColor = titleColor;
            }
        }

        runs.push(...parseBoldMarkdownToRuns(content, {
            font: lineFont,
            boldFont,
            color: lineColor
        }));

        if (index < lines.length - 1) {
            runs.push({ text: "\n", font: bodyFont, color: bodyColor });
        }
    });

    return runs;
}

function isSmallScreen() {
    return typeof window !== 'undefined' && window.innerWidth < 1024;
}