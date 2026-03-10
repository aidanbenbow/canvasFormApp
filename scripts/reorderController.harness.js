import { FormReorderController } from '../public/controllers/formReorderController.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function createController(overrides = {}) {
  const ctx = {
    ctx: {},
    pipeline: {
      toSceneCoords: (x, y) => ({ x, y })
    },
    canvas: {
      width: 1000,
      height: 500,
      style: {},
      addEventListener() {},
      removeEventListener() {},
      getBoundingClientRect() {
        return { left: 0, top: 0, width: 1000, height: 500 };
      },
      setPointerCapture() {},
      releasePointerCapture() {}
    }
  };

  return new FormReorderController({
    context: ctx,
    getContainer: () => null,
    getRootNode: () => ({ id: 'root' }),
    resolveFieldGroupIdFromNode: () => null,
    getSelectedFieldId: () => null,
    onSelectField: () => {},
    onReorder: () => {},
    onPreviewTargetChange: () => {},
    onDragStateChange: () => {},
    ...overrides
  });
}

function run(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}: ${error.message}`);
    process.exitCode = 1;
  }
}

if (typeof globalThis.requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = () => 1;
}
if (typeof globalThis.cancelAnimationFrame !== 'function') {
  globalThis.cancelAnimationFrame = () => {};
}

run('uses injected hit-test system', () => {
  let hitTestCalled = false;
  const hitTestSystem = {
    hitTest(root, x, y, drawCtx) {
      hitTestCalled = true;
      assert(root?.id === 'root', 'root node should be passed to injected hit-test system');
      assert(Number.isFinite(x) && Number.isFinite(y), 'scene coordinates should be numeric');
      assert(drawCtx && typeof drawCtx === 'object', 'draw context should be passed');
      return { id: 'node-from-hit-test' };
    }
  };

  const controller = createController({ hitTestSystem });
  const node = controller.getHitNodeAtClientPosition(10, 20);

  assert(hitTestCalled, 'injected hit-test system should be called');
  assert(node?.id === 'node-from-hit-test', 'controller should return node from injected hit-test system');
});

run('uses injected field-group resolver', () => {
  const controller = createController({
    resolveFieldGroupIdFromNode: (node) => (node?.id === 'group-node' ? 'group-1' : null)
  });

  controller.getHitNodeAtClientPosition = () => ({ id: 'group-node' });
  const fieldId = controller.getFieldGroupIdAtClientPosition(5, 5);

  assert(fieldId === 'group-1', 'field-group resolver should determine source field id');
});

run('pointer down on non-selected group requests selection, not drag', () => {
  const selections = [];
  const controller = createController({
    resolveFieldGroupIdFromNode: () => 'group-2',
    getSelectedFieldId: () => 'group-1',
    onSelectField: (fieldId) => selections.push(fieldId)
  });

  const handled = controller.handleCapturePointerDown({
    target: { id: 'group-2' },
    originalEvent: {
      clientX: 10,
      clientY: 10,
      pointerId: 1,
      pointerType: 'mouse'
    },
    stopPropagation() {}
  });

  assert(handled === false, 'capture should not swallow event when only selecting');
  assert(selections.length === 1 && selections[0] === 'group-2', 'non-selected pointer down should request selection');
  assert(controller.state.phase === 'idle', 'drag should not start on first tap');
});

run('resets preview coordinates on pending -> dragging transition', () => {
  const previewEvents = [];
  const controller = createController({
    dragThreshold: 8,
    onPreviewTargetChange: (fieldId) => previewEvents.push(fieldId)
  });

  controller.startPendingDrag({
    sourceFieldId: 'field-1',
    clientX: 10,
    clientY: 10,
    pointerId: 1,
    pointerType: 'mouse'
  });

  controller.state.previewFieldId = 'field-2';
  controller.state.lastPreviewClientX = 0;
  controller.state.lastPreviewClientY = 0;

  controller.handlePointerMove({
    pointerId: 1,
    clientX: 40,
    clientY: 40,
    preventDefault() {}
  });

  assert(controller.state.phase === 'dragging', 'controller should switch to dragging');
  assert(controller.state.previewFieldId === null, 'preview field should be reset at drag start');
  assert(controller.state.lastPreviewClientX === 40, 'preview X should reset to drag-start move X');
  assert(controller.state.lastPreviewClientY === 40, 'preview Y should reset to drag-start move Y');
  assert(previewEvents.includes(null), 'preview target should be cleared on drag start');
});

run('does not force pointer type back to mouse on pointer cancel', () => {
  const controller = createController();

  controller.startPendingDrag({
    sourceFieldId: 'field-1',
    clientX: 10,
    clientY: 10,
    pointerId: 7,
    pointerType: 'touch'
  });

  controller.handlePointerCancel({ pointerId: 7 });
  assert(controller.activePointerType === 'touch', 'active pointer type should remain touch after cancel');
});

run('guards against drop-on-self reorder', () => {
  const reorderCalls = [];
  const controller = createController({
    onReorder: (sourceId, targetId) => reorderCalls.push({ sourceId, targetId })
  });

  controller.state.phase = 'dragging';
  controller.state.sourceFieldId = 'field-1';
  controller.state.pointerId = 11;

  controller.getFieldIdAtClientPosition = () => 'field-1';
  controller.handlePointerUp({
    pointerId: 11,
    clientX: 20,
    clientY: 20,
    preventDefault() {}
  });

  assert(reorderCalls.length === 0, 'drop-on-self should not trigger reorder');
});

if (process.exitCode && process.exitCode !== 0) {
  process.exit(process.exitCode);
}

console.log('Reorder harness completed.');
