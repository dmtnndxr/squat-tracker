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
    expect(result.nextPreviousPoseState).toBe("down");
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
    expect(result.nextPreviousPoseState).toBe("up");
    expect(result.lastRepTimestamp).toBe(1000);
  });

  it("counts when a completed rep passes through middle between down and up", () => {
    const middleResult = applyCounterTransition({
      exercise: "squat",
      previousPoseState: "down",
      currentPoseState: "middle",
      repStarted: true,
      now: 1000,
      lastRepTimestamp: 0,
    });

    expect(middleResult.countedExercise).toBeNull();
    expect(middleResult.repStarted).toBe(true);
    expect(middleResult.nextPreviousPoseState).toBe("down");

    const upResult = applyCounterTransition({
      exercise: "squat",
      previousPoseState: middleResult.nextPreviousPoseState,
      currentPoseState: "up",
      repStarted: middleResult.repStarted,
      now: 1100,
      lastRepTimestamp: middleResult.lastRepTimestamp,
    });

    expect(upResult.countedExercise).toBe("squat");
  });

  it("bootstraps a rep when adaptive range proves an up posture was already observed", () => {
    const downResult = applyCounterTransition({
      exercise: "squat",
      previousPoseState: "down",
      currentPoseState: "down",
      repStarted: false,
      hasObservedUp: true,
      now: 1000,
      lastRepTimestamp: 0,
    });

    expect(downResult.countedExercise).toBeNull();
    expect(downResult.repStarted).toBe(true);

    const upResult = applyCounterTransition({
      exercise: "squat",
      previousPoseState: downResult.nextPreviousPoseState,
      currentPoseState: "up",
      repStarted: downResult.repStarted,
      hasObservedUp: true,
      now: 1200,
      lastRepTimestamp: downResult.lastRepTimestamp,
    });

    expect(upResult.countedExercise).toBe("squat");
  });

  it("does not bootstrap from down without evidence of an earlier up posture", () => {
    const result = applyCounterTransition({
      exercise: "squat",
      previousPoseState: "down",
      currentPoseState: "down",
      repStarted: false,
      hasObservedUp: false,
      now: 1000,
      lastRepTimestamp: 0,
    });

    expect(result.countedExercise).toBeNull();
    expect(result.repStarted).toBe(false);
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
