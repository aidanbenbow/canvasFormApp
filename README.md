An attemmpt to create a browser based HTML canvas app which can be used to generate forms to collect data!

## Architecture Responsibility Map

### UI builder / renderer
- Manifests define screen structure and field presentation.
- Manifest compiler builds root nodes and regions.
- UI factory instantiates node types and connects command actions.

Key files:
- `public/components/manifests/createFormManifest.js`
- `public/components/manifests/viewFormManifest.js`
- `public/components/uiManifestCompiler.js`
- `public/components/factory/baseUiFactory.js`

### Interaction manager
- Selection, drag-and-drop reorder, and builder interaction state are handled by controllers.
- Photo preview behavior (source sync, brightness slider reveal/update) is handled by `PhotoPreviewController`.

Key files:
- `public/controllers/formBuilderInteractionController.js`
- `public/controllers/formReorderController.js`
- `public/controllers/formBuilderFieldBindingController.js`
- `public/controllers/photoPreviewController.js`

### Plugin coordinator
- Field transformation is done through mode-based plugin pipelines.
- Plugin ordering and enablement is centralized in one config.

Key files:
- `public/components/fieldPlugins/fieldPluginConfig.js`
- `public/components/fieldPlugins/fieldPluginRegistry.js`
- `public/components/fieldPlugins/runFieldPlugins.js`

### CreateForm orchestration
- `CreateForm` now coordinates modules instead of owning all logic directly.
- Form data operations are delegated to `FormModel`.
- Command names/registration, field defaults, field ID resolution, photo binding, and editor interaction are extracted into dedicated helpers.

Key files:
- `public/components/createForm.js`
- `public/models/formModel.js`
- `public/components/createForm/createFormCommands.js`
- `public/components/createForm/createFormFieldFactory.js`
- `public/components/createForm/createFormFieldResolver.js`
- `public/components/createForm/createFormPhotoPreviewBinder.js`
- `public/components/createForm/createFormEditorInteraction.js`
