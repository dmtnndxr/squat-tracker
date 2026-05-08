import { describe, expect, it } from "vitest";
import { applyCounterTransition, REP_COOLDOWN_MS } from "./counter";

describe("applyCounterTransition", () => {
  it("starts a rep on up to down", () => {
    const result = applyCounterTransition({
      exercise: "pushup",
      previousPoseState: "up",
      currentPoseState: "down",
      repStarted: false,
      now: 1000,
      lastRepTimestamp: 0,
    });

    expect(result.repStarted).toBe(true);
    expect(result.countedExercise).toBeNull();
  });

  it("counts one push-up after up down up", () => {
    const result = applyCounterTransition({
      exercise: "pushup",
      previousPoseState: "down",
      currentPoseState: "up",
      repStarted: true,
      now: 1000,
      lastRepTimestamp: 0,
    });

    expect(result.countedExercise).toBe("pushup");
    expect(result.repStarted).toBe(false);
    expect(result.lastRepTimestamp).toBe(1000);
  });

  it("counts one squat after up down up", () => {
    const result = applyCounterTransition({
      exercise: "squat",
      previousPoseState: "down",
      currentPoseState: "up",
      repStarted: true,
      now: 1000,
      lastRepTimestamp: 0,
    });

    expect(result.countedExercise).toBe("squat");
  });

  it("does not count partial transitions", () => {
    const result = applyCounterTransition({
      exercise: "squat",
      previousPoseState: "middle",
      currentPoseState: "up",
      repStarted: false,
      now: 1000,
      lastRepTimestamp: 0,
    });

    expect(result.countedExercise).toBeNull();
    expect(result.repStarted).toBe(false);
  });

  it("prevents duplicate counts during cooldown", () => {
    const result = applyCounterTransition({
      exercise: "pushup",
      previousPoseState: "down",
      currentPoseState: "up",
      repStarted: true,
      now: 1000,
      lastRepTimestamp: 1000 - REP_COOLDOWN_MS + 1,
    });

    expect(result.countedExercise).toBeNull();
    expect(result.repStarted).toBe(true);
  });
});
