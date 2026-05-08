import { describe, expect, it } from "vitest";
import type { Point } from "../types/exercise";
import { evaluateExercisePose, getExerciseAngle, LANDMARK_INDEX } from "./landmarks";

function landmarksWith(points: Partial<Record<number, Point>>): Point[] {
  const landmarks = Array.from({ length: 33 }, () => ({ x: 0, y: 0, visibility: 0 })) as Point[];

  for (const [index, point] of Object.entries(points)) {
    if (point) {
      landmarks[Number(index)] = point;
    }
  }

  return landmarks;
}

describe("landmark exercise evaluation", () => {
  it("calculates visible elbow angle for push-ups", () => {
    const angle = getExerciseAngle(
      "pushup",
      landmarksWith({
        [LANDMARK_INDEX.leftShoulder]: { x: 0, y: 0, visibility: 1 },
        [LANDMARK_INDEX.leftElbow]: { x: 1, y: 0, visibility: 1 },
        [LANDMARK_INDEX.leftWrist]: { x: 2, y: 0, visibility: 1 },
      }),
    );

    expect(angle).toBeCloseTo(180);
  });

  it("ignores low-visibility landmarks", () => {
    const angle = getExerciseAngle(
      "squat",
      landmarksWith({
        [LANDMARK_INDEX.leftHip]: { x: 0, y: 0, visibility: 0.4 },
        [LANDMARK_INDEX.leftKnee]: { x: 1, y: 0, visibility: 1 },
        [LANDMARK_INDEX.leftAnkle]: { x: 2, y: 0, visibility: 1 },
      }),
    );

    expect(angle).toBeNull();
  });

  it("classifies push-up and squat thresholds", () => {
    expect(evaluateExercisePose("pushup", 151).poseState).toBe("up");
    expect(evaluateExercisePose("pushup", 94).poseState).toBe("down");
    expect(evaluateExercisePose("squat", 161).poseState).toBe("up");
    expect(evaluateExercisePose("squat", 99).poseState).toBe("down");
  });

  it("reports bad angle separately from missing person detection", () => {
    expect(evaluateExercisePose("pushup", null)).toMatchObject({
      isPersonDetected: true,
      status: "Bad angle",
      poseState: "unknown",
    });
  });
});
