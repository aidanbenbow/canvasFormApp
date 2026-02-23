import { BaseScreen } from './baseScreen.js';
import { compileUIManifest } from './uiManifestCompiler.js';
import { buttonNode, containerRegion, defineManifest, textNode } from './manifests/manifestDsl.js';

const toolbarButtonStyle = { fillWidth: false, font: '20px sans-serif', paddingX: 14, paddingY: 8 };

export class UIFormResults extends BaseScreen {
    constructor({
        id = 'formResults',
        context,
        dispatcher,
        eventBusManager,
        store,
        factories,
        commandRegistry,
        router,
        results
    }) {
        super({ id, context, dispatcher, eventBusManager });
        this.store = store;
        this.factories = factories;
        this.commandRegistry = commandRegistry;
        this.router = router;
        this.form = this.store.getActiveForm();
        this.results = Array.isArray(results)
            ? results
            : this.store.getFormResults(this.form?.id);

        this.closeCommand = `${this.id}.close`;
    }

    createRoot() {
        this.commandRegistry.register(this.closeCommand, () => {
            this.router?.pop?.();
        });

        const manifest = buildResultsManifest({
            form: this.form,
            closeCommand: this.closeCommand,
            rows: buildResultRows(this.results)
        });

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

    onExit() {
        this.commandRegistry?.unregister?.(this.closeCommand);
    }
}

function buildResultsManifest({ form, closeCommand, rows }) {
    const title = `Results: ${form?.label || 'Form'}`;

    return defineManifest({
        layout: 'vertical',
        id: 'results-root',
        style: {
            background: '#ffffff'
        },
        regions: {
            toolbar: containerRegion({
                layout: 'horizontal',
                style: {
                    background: '#f3f4f6',
                    border: { color: '#d1d5db', width: 1 }
                },
                children: [
                    buttonNode({
                        id: 'results-close',
                        label: 'Close',
                        action: closeCommand,
                        style: toolbarButtonStyle,
                        skipCollect: true,
                        skipClear: true
                    })
                ]
            }),
            results: containerRegion({
                scrollable: true,
                viewport: 620,
                style: {
                    background: '#ffffff'
                },
                children: [
                    textNode({
                        id: 'results-title',
                        text: title,
                        style: { font: '20px sans-serif', color: '#111827' }
                    }),
                    ...rows
                ]
            })
        }
    });
}

function buildResultRows(results = []) {
    const normalizedResults = Array.isArray(results) ? results : [];
    if (!normalizedResults.length) {
        return [
            textNode({
                id: 'results-empty',
                text: 'No saved results for this form yet.',
                style: { font: '20px sans-serif', color: '#6b7280' }
            })
        ];
    }

    const rows = [];

    rows.push(
        textNode({
            id: 'results-count',
            text: `Total submissions: ${normalizedResults.length}`,
            style: { font: '18px sans-serif', color: '#4b5563' }
        })
    );

    normalizedResults.forEach((result, index) => {
        rows.push(
            textNode({
                id: `result-block-${index}`,
                text: buildResultBlockText(result, index),
                style: { font: '18px sans-serif', color: '#1f2937' }
            })
        );
    });

    return rows;
}

function buildResultBlockText(result, index) {
    const user = result?.user ? ` • ${result.user}` : '';
    const timestamp = formatTimestamp(result?.timestamp || result?.createdAt || null);
    const heading = `#${index + 1}${timestamp ? ` • ${timestamp}` : ''}${user}`;
    const inputEntries = Object.entries(extractInputMap(result));

    if (!inputEntries.length) {
        return `${heading}\n  (no input values)`;
    }

    const body = inputEntries
        .map(([key, value]) => `  ${key}: ${formatValue(value)}`)
        .join('\n');

    return `${heading}\n${body}`;
}

function extractInputMap(result) {
    if (!result || typeof result !== 'object') return {};

    if (result.inputs && typeof result.inputs === 'object' && !Array.isArray(result.inputs)) {
        return result.inputs;
    }

    if (result.fields && typeof result.fields === 'object' && !Array.isArray(result.fields)) {
        return result.fields;
    }

    if (result.responses && typeof result.responses === 'object' && !Array.isArray(result.responses)) {
        return result.responses;
    }

    const excluded = new Set(['id', 'formId', 'user', 'timestamp', 'createdAt', 'updatedAt']);
    return Object.fromEntries(
        Object.entries(result).filter(([key, value]) => {
            if (excluded.has(key)) return false;
            if (value === null || value === undefined) return false;
            return typeof value !== 'object' || Array.isArray(value);
        })
    );
}

function formatTimestamp(value) {
    if (value === null || value === undefined) return '';

    const numeric = Number(value);
    const date = Number.isFinite(numeric) ? new Date(numeric) : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString();
}

function formatValue(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

