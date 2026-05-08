export type ExerciseType = "pushup" | "squat";

export type PoseState = "up" | "down" | "middle" | "unknown";

export type ExerciseTotals = {
  pushups: number;
  squats: number;
};

export type Point = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

export type ExerciseCounterState = {
  selectedExercise: ExerciseType;
  sessionPushups: number;
  sessionSquats: number;
  totalPushups: number;
  totalSquats: number;
  currentPoseState: PoseState;
  previousPoseState: PoseState;
  repStarted: boolean;
  isCameraActive: boolean;
  isPersonDetected: boolean;
};

export type PoseEvaluation = {
  poseState: PoseState;
  isPersonDetected: boolean;
  status: string;
  angle: number | null;
  hasObservedUp: boolean;
};

export type AngleRange = {
  min: number | null;
  max: number | null;
};

export type PoseThresholds = {
  up: number;
  down: number;
  source: "default" | "adaptive";
};
