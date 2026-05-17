import { describe, expect, it } from "vitest";
import { applyCounterTransition, SQUAT_REP_COOLDOWN_MS } from "./counter";
import type { CounterTransitionInput } from "./counter";

function input(overrides: Partial<CounterTransitionInput>): CounterTransitionInput {
  return {
    exercise: "squat",
    previousPoseState: "up",
    currentPoseState: "down",
    currentAngle: 100,
    repStarted: false,
    repPeakAngle: 165,
    repBottomAngle: null,
    now: 1_000,
    lastRepTimestamp: 0,
    ...overrides,
  };
}

describe("applyCounterTransition", () => {
  it("starts a rep only after a stable up to down transition", () => {
    const transition = applyCounterTransition(input({ previousPoseState: "up", currentPoseState: "down" }));

    expect(transition.countedExercise).toBeNull();
    expect(transition.repStarted).toBe(true);
    expect(transition.repPeakAngle).toBe(165);
    expect(transition.repBottomAngle).toBe(100);
  });

  it("does not count a shallow squat", () => {
    const transition = applyCounterTransition(
      input({
        previousPoseState: "down",
        currentPoseState: "up",
        currentAngle: 150,
        repStarted: true,
        repPeakAngle: 165,
        repBottomAngle: 130,
        now: SQUAT_REP_COOLDOWN_MS + 1,
      }),
    );

    expect(transition.countedExercise).toBeNull();
    expect(transition.repStarted).toBe(false);
  });

  it("counts a full squat after enough travel and cooldown", () => {
    const transition = applyCounterTransition(
      input({
        previousPoseState: "down",
        currentPoseState: "up",
        currentAngle: 166,
        repStarted: true,
        repPeakAngle: 166,
        repBottomAngle: 98,
        now: SQUAT_REP_COOLDOWN_MS + 1,
      }),
    );

    expect(transition.countedExercise).toBe("squat");
    expect(transition.repStarted).toBe(false);
  });

  it("clears an in-progress rep when the pose becomes unknown", () => {
    const transition = applyCounterTransition(
      input({
        currentPoseState: "unknown",
        currentAngle: null,
        repStarted: true,
        repPeakAngle: 165,
        repBottomAngle: 100,
      }),
    );

    expect(transition.countedExercise).toBeNull();
    expect(transition.repStarted).toBe(false);
    expect(transition.repPeakAngle).toBeNull();
    expect(transition.repBottomAngle).toBeNull();
  });
});
