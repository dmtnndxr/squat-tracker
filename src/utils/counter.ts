import type { ExerciseType, PoseState } from "../types/exercise";

export const REP_COOLDOWN_MS = 500;

export type CounterTransitionInput = {
  exercise: ExerciseType;
  previousPoseState: PoseState;
  currentPoseState: PoseState;
  repStarted: boolean;
  hasObservedUp?: boolean;
  now: number;
  lastRepTimestamp: number;
};

export type CounterTransitionResult = {
  countedExercise: ExerciseType | null;
  repStarted: boolean;
  nextPreviousPoseState: PoseState;
  lastRepTimestamp: number;
};

export function applyCounterTransition(input: CounterTransitionInput): CounterTransitionResult {
  const { exercise, previousPoseState, currentPoseState, now, lastRepTimestamp } = input;
  let repStarted = input.repStarted;
  const nextPreviousPoseState = currentPoseState === "middle" ? previousPoseState : currentPoseState;

  if (previousPoseState === "up" && currentPoseState === "down") {
    repStarted = true;
  }

  if (input.hasObservedUp && currentPoseState === "down") {
    repStarted = true;
  }

  if (
    repStarted &&
    currentPoseState === "up" &&
    now - lastRepTimestamp >= REP_COOLDOWN_MS
  ) {
    return {
      countedExercise: exercise,
      repStarted: false,
      nextPreviousPoseState,
      lastRepTimestamp: now,
    };
  }

  return {
    countedExercise: null,
    repStarted,
    nextPreviousPoseState,
    lastRepTimestamp,
  };
}
