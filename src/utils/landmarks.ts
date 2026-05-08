import type { ExerciseType, Point, PoseEvaluation, PoseState } from "../types/exercise";
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

export function evaluateExercisePose(exercise: ExerciseType, angle: number | null): PoseEvaluation {
  if (angle === null) {
    return {
      poseState: "unknown",
      isPersonDetected: true,
      status: "Bad angle",
      angle: null,
    };
  }

  const poseState =
    exercise === "pushup" ? stateFromAngle(angle, 150, 95) : stateFromAngle(angle, 160, 100);

  return {
    poseState,
    isPersonDetected: true,
    status: "Detected",
    angle,
  };
}
