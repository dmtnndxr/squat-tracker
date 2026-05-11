export const BACKGROUND_DETECTION_INTERVAL_MS = 250;

type FrameLoopOptions = {
  backgroundIntervalMs?: number;
  getVisibilityState?: () => DocumentVisibilityState;
  requestAnimationFrameFn?: typeof requestAnimationFrame;
  cancelAnimationFrameFn?: typeof cancelAnimationFrame;
  setTimeoutFn?: typeof setTimeout;
  clearTimeoutFn?: typeof clearTimeout;
  addVisibilityListener?: (listener: EventListener) => void;
  removeVisibilityListener?: (listener: EventListener) => void;
};

export type FrameLoop = {
  cancel: () => void;
};

export function startVisibilityAwareFrameLoop(
  callback: () => void,
  {
    backgroundIntervalMs = BACKGROUND_DETECTION_INTERVAL_MS,
    getVisibilityState = () => document.visibilityState,
    requestAnimationFrameFn = requestAnimationFrame,
    cancelAnimationFrameFn = cancelAnimationFrame,
    setTimeoutFn = setTimeout,
    clearTimeoutFn = clearTimeout,
    addVisibilityListener = (listener) => document.addEventListener("visibilitychange", listener),
    removeVisibilityListener = (listener) => document.removeEventListener("visibilitychange", listener),
  }: FrameLoopOptions = {},
): FrameLoop {
  let isCancelled = false;
  let animationFrameId: number | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  function clearScheduledFrame() {
    if (animationFrameId !== null) {
      cancelAnimationFrameFn(animationFrameId);
      animationFrameId = null;
    }

    if (timeoutId !== null) {
      clearTimeoutFn(timeoutId);
      timeoutId = null;
    }
  }

  function scheduleNextFrame() {
    if (isCancelled) {
      return;
    }

    if (getVisibilityState() === "hidden") {
      timeoutId = setTimeoutFn(runFrame, backgroundIntervalMs);
      return;
    }

    animationFrameId = requestAnimationFrameFn(runFrame);
  }

  function runFrame() {
    animationFrameId = null;
    timeoutId = null;

    if (isCancelled) {
      return;
    }

    callback();
    scheduleNextFrame();
  }

  function handleVisibilityChange() {
    clearScheduledFrame();
    scheduleNextFrame();
  }

  addVisibilityListener(handleVisibilityChange);
  scheduleNextFrame();

  return {
    cancel: () => {
      isCancelled = true;
      clearScheduledFrame();
      removeVisibilityListener(handleVisibilityChange);
    },
  };
}
