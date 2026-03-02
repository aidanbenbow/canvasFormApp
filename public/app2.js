
import { TOKENS } from "./core/di/tokens.js";

import { RendererContext } from "../renderers/rendererContext.js";

import { RenderPipeline } from "../renderers/pipeline.js";

import { CommandRegistry } from "../application/commands/CommandRegistry.js";
import { ScreenRouter } from "../routing/ScreenRouter.js";
import { createRepositories } from "../infrastructure/createRepositories.js";
import { createServices } from "../application/createServices.js";
import { Container } from "./core/di/Container.js";
import { UIEngine } from "./setUp/uiEngine.js";
import { TextEditorController } from "./controllers/textEditor.js";
import { FocusManager } from "./managers/focusManager.js";
import { AssetRegistry } from "./registries/assetRegistry.js";
import { UIStateStore } from "./events/UiStateStore.js";
import { DragController } from "./controllers/dragController.js";

export function buildContainer({ canvas, hitCanvas }) {
  const c = new Container();

  // --- Infrastructure ---
  c.singleton(TOKENS.repositories, () => createRepositories());
  c.singleton(TOKENS.services, (x) => createServices(x.resolve(TOKENS.repositories)));

  // --- UI Infrastructure ---
  c.singleton(TOKENS.rendererContext, () => {
    const ctx = canvas.getContext("2d");
    const hitCtx = hitCanvas.getContext("2d");
    if (!ctx || !hitCtx) throw new Error("Unable to acquire 2D contexts.");

    return new RendererContext({
      ctx,
      hitCtx,
      hitRegistry: null,
      hitManager: null,
      pipeline: new RenderPipeline(),
      textEditorController: new TextEditorController(),
      selectionController: null,
      focusManager: new FocusManager(),
      assetRegistry: new AssetRegistry(),
      canvas,
      uiState: new UIStateStore(),
      dragController: new DragController(),
    });
  });

  c.singleton(TOKENS.uiEngine, (x) =>
    new UIEngine({
      rendererContext: x.resolve(TOKENS.rendererContext),
      services: x.resolve(TOKENS.services),
    })
  );

  // --- App Layer ---
  c.singleton(TOKENS.commandRegistry, (x) =>
    new CommandRegistry(x.resolve(TOKENS.services))
  );

  c.singleton(TOKENS.screenRouter, (x) =>
    new ScreenRouter({
      uiEngine: x.resolve(TOKENS.uiEngine),
    })
  );

  return c;
}