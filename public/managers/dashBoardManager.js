import { init, setupAdminPlugins } from "../app.js";
import { DashboardOverlay } from "../overlays/dashboardOverlay.js";
import { FormResultsOverlay } from "../overlays/formResults.js";


export class DashboardManager {
  constructor({ ctx, layoutManager, pipeline, adminOverlay, context }) {
    this.ctx = ctx;
    this.layoutManager = layoutManager;
    this.pipeline = pipeline;
    this.adminOverlay = adminOverlay;
    this.context = context;
    this.forms = [];
    this.overlay = null;
  }

  loadForms(rawData) {
    try {
      this.forms = JSON.parse(rawData);
    } catch (e) {
      console.warn('Failed to parse form data:', e);
      this.forms = [];
    }
  }

  showDashboard() {
    this.overlay = new DashboardOverlay({
      ctx: this.ctx,
      forms: this.forms,
      layoutManager: this.layoutManager,
      onCreateForm: () => this.handleCreateForm(),
      onEditForm: (form) => this.handleEditForm(form),
      onViewResults: (formMeta) => this.handleViewResults(formMeta)
    });

    this.adminOverlay.register(this.overlay);
    this.pipeline.add(this.overlay);
    this.overlay.render({ ctx: this.ctx });
    this.pipeline.invalidate();
  }

  handleCreateForm() {
    setupAdminPlugins({
      adminOverlay: this.adminOverlay,
      hitRegistry: this.context.hitRegistry,
      hitCtx: this.context.canvas.getHitContext('main'),

      logicalWidth: this.context.logicalWidth,
      boxEditor: this.context.boxEditor,
      renderer: this.pipeline
    });
    init(JSON.stringify([null, null]));
    this.pipeline.invalidate();
  }

  handleEditForm(form) {
    setupAdminPlugins({
      adminOverlay: this.adminOverlay,
      hitRegistry: this.context.hitRegistry,
      hitCtx: this.context.canvas.getHitContext('main'),

      logicalWidth: this.context.logicalWidth,
      boxEditor: this.context.boxEditor,
      renderer: this.pipeline
    });
    this.context.boxEditor.formMeta = form;
    init(JSON.stringify([null, form]));
    this.adminOverlay.unregister(this.overlay);
    this.pipeline.invalidate();
  }

  handleViewResults(formMeta) {
    this.adminOverlay.unregister(this.overlay);

    fetchFormResults(formMeta.id, (results) => {
      const resultsOverlay = new FormResultsOverlay({
        ctx: this.ctx,
        form: { ...formMeta, responses: results },
        onBack: () => {
          resultsOverlay.unbindEvents();
          this.adminOverlay.unregister(resultsOverlay);
          this.adminOverlay.register(this.overlay);
          this.pipeline.invalidate();
        }
      });

      resultsOverlay.registerHitRegion(this.context.hitRegistry);
      resultsOverlay.bindEvents();
      this.adminOverlay.register(resultsOverlay);
      this.pipeline.invalidate();
    }, formMeta.resultsTable || 'cscstudents');
  }
}
