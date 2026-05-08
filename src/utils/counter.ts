import type { ExerciseType, PoseState } from "../types/exercise";

export const REP_COOLDOWN_MS = 500;

export type CounterTransitionInput = {
  exercise: ExerciseType;
  previousPoseState: PoseState;
  currentPoseState: PoseState;
  repStarted: boolean;
  now: number;
  lastRepTimestamp: number;
};

export type CounterTransitionResult = {
  countedExercise: ExerciseType | null;
  repStarted: boolean;
  lastRepTimestamp: number;
};

export function applyCounterTransition(input: CounterTransitionInput): CounterTransitionResult {
  const { exercise, previousPoseState, currentPoseState, now, lastRepTimestamp } = input;
  let repStarted = input.repStarted;

  if (previousPoseState === "up" && currentPoseState === "down") {
    repStarted = true;
  }

  if (
    repStarted &&
    previousPoseState === "down" &&
    currentPoseState === "up" &&
    now - lastRepTimestamp >= REP_COOLDOWN_MS
  ) {
    return {
      countedExercise: exercise,
      repStarted: false,
      lastRepTimestamp: now,
    };
  }

  return {
    countedExercise: null,
    repStarted,
    lastRepTimestamp,
  };
}
