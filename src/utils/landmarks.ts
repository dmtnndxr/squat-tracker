import type {
  AngleRange,
  ExerciseType,
  Point,
  PoseEvaluation,
  PoseState,
  PoseThresholds,
} from "../types/exercise";
import { average, calculateAngle } from "./angles";

export const MIN_LANDMARK_VISIBILITY = 0.5;

export const LANDMARK_INDEX = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
} as const;

function isVisible(point: Point | undefined): point is Point {
  return Boolean(point && (point.visibility ?? 1) >= MIN_LANDMARK_VISIBILITY);
}

function sideAngle(landmarks: Point[], first: number, joint: number, third: number): number | null {
  const a = landmarks[first];
  const b = landmarks[joint];
  const c = landmarks[third];

  if (!isVisible(a) || !isVisible(b) || !isVisible(c)) {
    return null;
  }

  return calculateAngle(a, b, c);
}

function stateFromAngle(angle: number, upThreshold: number, downThreshold: number): PoseState {
  if (angle > upThreshold) {
    return "up";
  }

  if (angle < downThreshold) {
    return "down";
  }

  return "middle";
}

export function getDefaultThresholds(exercise: ExerciseType): PoseThresholds {
  return exercise === "pushup"
    ? { up: 150, down: 95, source: "default" }
    : { up: 160, down: 100, source: "default" };
}

export function getAdaptiveThresholds(exercise: ExerciseType, angleRange: AngleRange): PoseThresholds {
  const defaults = getDefaultThresholds(exercise);

  if (angleRange.min === null || angleRange.max === null) {
    return defaults;
  }

  const spread = angleRange.max - angleRange.min;

  if (exercise === "squat") {
    if (spread < 55 || angleRange.min > 125 || angleRange.max < 145) {
      return defaults;
    }

    return {
      down: Math.max(85, Math.min(115, angleRange.min + spread * 0.3)),
      up: Math.max(145, Math.min(170, angleRange.min + spread * 0.78)),
      source: "adaptive",
    };
  }

  if (spread < 20) {
    return defaults;
  }

  return {
    down: angleRange.min + spread * 0.35,
    up: angleRange.min + spread * 0.65,
    source: "adaptive",
  };
}

export function getExerciseAngle(exercise: ExerciseType, landmarks: Point[]): number | null {
  if (exercise === "pushup") {
    return average(
      [
        sideAngle(
          landmarks,
          LANDMARK_INDEX.leftShoulder,
          LANDMARK_INDEX.leftElbow,
          LANDMARK_INDEX.leftWrist,
        ),
        sideAngle(
          landmarks,
          LANDMARK_INDEX.rightShoulder,
          LANDMARK_INDEX.rightElbow,
          LANDMARK_INDEX.rightWrist,
        ),
      ].filter((value): value is number => value !== null),
    );
  }

  return average(
    [
      sideAngle(landmarks, LANDMARK_INDEX.leftHip, LANDMARK_INDEX.leftKnee, LANDMARK_INDEX.leftAnkle),
      sideAngle(
        landmarks,
        LANDMARK_INDEX.rightHip,
        LANDMARK_INDEX.rightKnee,
        LANDMARK_INDEX.rightAnkle,
      ),
    ].filter((value): value is number => value !== null),
  );
}

export function evaluateExercisePose(
  exercise: ExerciseType,
  angle: number | null,
  thresholds = getDefaultThresholds(exercise),
  angleRange: AngleRange = { min: null, max: null },
): PoseEvaluation {
  if (angle === null) {
    return {
      poseState: "unknown",
      isPersonDetected: true,
      status: "Bad angle",
      angle: null,
      hasObservedUp: false,
    };
  }

  const poseState = stateFromAngle(angle, thresholds.up, thresholds.down);

  return {
    poseState,
    isPersonDetected: true,
    status: "Detected",
    angle,
    hasObservedUp: angleRange.max !== null && angleRange.max > thresholds.up,
  };
}
