const SCREEN_PIPELINE_STAGES = Object.freeze([
  'buildManifest',
  'render',
  'attachModules',
  'bindInteractions',
  'finalize'
]);

export class ScreenPipeline {
  constructor({ stages = {}, enableTiming = false, logger, name = 'ScreenPipeline' } = {}) {
    this.stages = Object.fromEntries(
      SCREEN_PIPELINE_STAGES.map((stage) => [stage, null])
    );
    this.enableTiming = Boolean(enableTiming);
    this.logger = typeof logger === 'function' ? logger : console.log;
    this.name = name;

    this.useStages(stages);
  }

  useStages(stages = {}) {
    for (const [name, handler] of Object.entries(stages)) {
      this.setStage(name, handler);
    }
  }

  setStage(name, handler) {
    if (!SCREEN_PIPELINE_STAGES.includes(name)) {
      throw new Error(`Unknown screen pipeline stage: ${name}`);
    }

    if (handler !== null && typeof handler !== 'function') {
      throw new Error(`Pipeline stage handler must be a function: ${name}`);
    }

    this.stages[name] = handler;
  }

  run(input = {}) {
    let state = { ...input };
    const timing = this.enableTiming ? createTimingStore() : null;

    for (const stageName of SCREEN_PIPELINE_STAGES) {
      const handler = this.stages[stageName];
      if (typeof handler !== 'function') continue;

      const stageStart = timing ? nowMs() : 0;
      const result = handler(state);
      if (timing) {
        timing.stageDurations[stageName] = nowMs() - stageStart;
      }

      if (stageName === 'finalize' && result !== undefined) {
        if (timing) {
          timing.totalDuration = nowMs() - timing.startedAt;
          this.logTiming(timing);
        }
        return result;
      }

      if (result && typeof result === 'object' && !Array.isArray(result)) {
        state = { ...state, ...result };
      }
    }

    if (timing) {
      timing.totalDuration = nowMs() - timing.startedAt;
      this.logTiming(timing);
    }

    return state?.screen || state;
  }

  logTiming(timing) {
    const stageSummary = SCREEN_PIPELINE_STAGES
      .filter((stageName) => timing.stageDurations[stageName] !== undefined)
      .map((stageName) => `${stageName}=${timing.stageDurations[stageName].toFixed(2)}ms`)
      .join(' | ');

    this.logger?.(
      `[${this.name}] ${stageSummary} | total=${timing.totalDuration.toFixed(2)}ms`
    );
  }
}

function nowMs() {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }

  return Date.now();
}

function createTimingStore() {
  return {
    startedAt: nowMs(),
    stageDurations: {},
    totalDuration: 0
  };
}
