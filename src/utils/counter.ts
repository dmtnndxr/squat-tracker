import type { ExerciseType, PoseState } from "../types/exercise";

export const REP_COOLDOWN_MS = 500;
export const SQUAT_REP_COOLDOWN_MS = 400;

const MIN_REP_ANGLE_TRAVEL: Record<ExerciseType, number> = {
  pushup: 25,
  squat: 45,
};

export type CounterTransitionInput = {
  exercise: ExerciseType;
  previousPoseState: PoseState;
  currentPoseState: PoseState;
  currentAngle: number | null;
  repStarted: boolean;
  repPeakAngle: number | null;
  repBottomAngle: number | null;
  now: number;
  lastRepTimestamp: number;
};

export type CounterTransitionResult = {
  countedExercise: ExerciseType | null;
  repStarted: boolean;
  repPeakAngle: number | null;
  repBottomAngle: number | null;
  nextPreviousPoseState: PoseState;
  lastRepTimestamp: number;
};

export function applyCounterTransition(input: CounterTransitionInput): CounterTransitionResult {
  const { exercise, previousPoseState, currentPoseState, currentAngle, now, lastRepTimestamp } = input;
  let repStarted = input.repStarted;
  let repPeakAngle = input.repPeakAngle;
  let repBottomAngle = input.repBottomAngle;
  const cooldownMs = exercise === "squat" ? SQUAT_REP_COOLDOWN_MS : REP_COOLDOWN_MS;
  const nextPreviousPoseState = currentPoseState === "middle" ? previousPoseState : currentPoseState;

  if (currentPoseState === "unknown") {
    return {
      countedExercise: null,
      repStarted: false,
      repPeakAngle: null,
      repBottomAngle: null,
      nextPreviousPoseState,
      lastRepTimestamp,
    };
  }

  if (!repStarted && currentPoseState === "up" && currentAngle !== null) {
    repPeakAngle = repPeakAngle === null ? currentAngle : Math.max(repPeakAngle, currentAngle);
  }

  if (!repStarted && previousPoseState === "up" && currentPoseState === "down") {
    repStarted = true;
    repBottomAngle = currentAngle;
  }

  if (repStarted && currentAngle !== null) {
    repPeakAngle = repPeakAngle === null ? currentAngle : Math.max(repPeakAngle, currentAngle);
    repBottomAngle = repBottomAngle === null ? currentAngle : Math.min(repBottomAngle, currentAngle);
  }

  const hasEnoughTravel =
    repPeakAngle !== null &&
    repBottomAngle !== null &&
    repPeakAngle - repBottomAngle >= MIN_REP_ANGLE_TRAVEL[exercise];

  if (
    repStarted &&
    currentPoseState === "up" &&
    hasEnoughTravel &&
    now - lastRepTimestamp >= cooldownMs
  ) {
    return {
      countedExercise: exercise,
      repStarted: false,
      repPeakAngle: currentAngle,
      repBottomAngle: null,
      nextPreviousPoseState,
      lastRepTimestamp: now,
    };
  }

  if (repStarted && currentPoseState === "up" && !hasEnoughTravel) {
    return {
      countedExercise: null,
      repStarted: false,
      repPeakAngle: currentAngle,
      repBottomAngle: null,
      nextPreviousPoseState,
      lastRepTimestamp,
    };
  }

  return {
    countedExercise: null,
    repStarted,
    repPeakAngle,
    repBottomAngle,
    nextPreviousPoseState,
    lastRepTimestamp,
  };
}
