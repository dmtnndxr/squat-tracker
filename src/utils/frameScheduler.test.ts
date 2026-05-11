import { afterEach, describe, expect, it, vi } from "vitest";
import { BACKGROUND_DETECTION_INTERVAL_MS, startVisibilityAwareFrameLoop } from "./frameScheduler";

describe("startVisibilityAwareFrameLoop", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("uses requestAnimationFrame when the tab is visible", () => {
    const callback = vi.fn();
    const animationFrameCallbacks: FrameRequestCallback[] = [];
    const requestAnimationFrameFn = vi.fn((next: FrameRequestCallback) => {
      animationFrameCallbacks.push(next);
      return 1;
    });
    const cancelAnimationFrameFn = vi.fn();

    const loop = startVisibilityAwareFrameLoop(callback, {
      getVisibilityState: () => "visible",
      requestAnimationFrameFn,
      cancelAnimationFrameFn,
      addVisibilityListener: vi.fn(),
      removeVisibilityListener: vi.fn(),
    });

    expect(requestAnimationFrameFn).toHaveBeenCalledTimes(1);

    animationFrameCallbacks[0](16);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(requestAnimationFrameFn).toHaveBeenCalledTimes(2);

    loop.cancel();

    expect(cancelAnimationFrameFn).toHaveBeenCalledWith(1);
  });

  it("uses a timer when the tab is hidden", () => {
    vi.useFakeTimers();

    const callback = vi.fn();
    const requestAnimationFrameFn = vi.fn();

    const loop = startVisibilityAwareFrameLoop(callback, {
      getVisibilityState: () => "hidden",
      requestAnimationFrameFn,
      addVisibilityListener: vi.fn(),
      removeVisibilityListener: vi.fn(),
    });

    expect(requestAnimationFrameFn).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(BACKGROUND_DETECTION_INTERVAL_MS);

    expect(callback).toHaveBeenCalledTimes(1);

    loop.cancel();
  });

  it("reschedules immediately when visibility changes", () => {
    vi.useFakeTimers();

    const callback = vi.fn();
    let visibilityState: DocumentVisibilityState = "visible";
    const visibilityListeners: EventListener[] = [];
    const requestAnimationFrameFn = vi.fn(() => 7);
    const cancelAnimationFrameFn = vi.fn();

    const loop = startVisibilityAwareFrameLoop(callback, {
      getVisibilityState: () => visibilityState,
      requestAnimationFrameFn,
      cancelAnimationFrameFn,
      addVisibilityListener: (listener) => {
        visibilityListeners.push(listener);
      },
      removeVisibilityListener: vi.fn(),
    });

    expect(requestAnimationFrameFn).toHaveBeenCalledTimes(1);

    visibilityState = "hidden";
    visibilityListeners[0](new Event("visibilitychange"));

    expect(cancelAnimationFrameFn).toHaveBeenCalledWith(7);

    vi.advanceTimersByTime(BACKGROUND_DETECTION_INTERVAL_MS);

    expect(callback).toHaveBeenCalledTimes(1);

    loop.cancel();
  });
});
