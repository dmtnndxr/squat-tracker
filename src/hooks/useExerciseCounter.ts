import { useCallback, useRef, useState } from "react";
import type { ExerciseType, PoseEvaluation, PoseState } from "../types/exercise";
import { applyCounterTransition } from "../utils/counter";
import {
  INITIAL_POSE_STABILITY_STATE,
  updateStablePoseState,
  type PoseStabilityState,
} from "../utils/poseStability";

export type SessionCounts = {
  pushups: number;
  squats: number;
};

export function useExerciseCounter(onRepCounted: (exercise: ExerciseType, countKey: keyof SessionCounts) => void) {
  const [sessionCounts, setSessionCounts] = useState<SessionCounts>({ pushups: 0, squats: 0 });
  const [currentPoseState, setCurrentPoseState] = useState<PoseState>("unknown");
  const previousPoseStateRef = useRef<PoseState>("unknown");
  const repStartedRef = useRef(false);
  const repPeakAngleRef = useRef<number | null>(null);
  const repBottomAngleRef = useRef<number | null>(null);
  const lastRepTimestampRef = useRef(0);
  const poseStabilityRef = useRef<PoseStabilityState>(INITIAL_POSE_STABILITY_STATE);

  const processPose = useCallback(
    (exercise: ExerciseType, evaluation: PoseEvaluation) => {
      const now = Date.now();
      const nextStability = updateStablePoseState(
        poseStabilityRef.current,
        evaluation.poseState,
        now,
      );
      poseStabilityRef.current = nextStability;

      const nextPoseState = nextStability.stablePoseState;
      const previousPoseState = previousPoseStateRef.current;

      const transition = applyCounterTransition({
        exercise,
        previousPoseState,
        currentPoseState: nextPoseState,
        currentAngle: evaluation.angle,
        repStarted: repStartedRef.current,
        repPeakAngle: repPeakAngleRef.current,
        repBottomAngle: repBottomAngleRef.current,
        now,
        lastRepTimestamp: lastRepTimestampRef.current,
      });

      repStartedRef.current = transition.repStarted;
      repPeakAngleRef.current = transition.repPeakAngle;
      repBottomAngleRef.current = transition.repBottomAngle;
      lastRepTimestampRef.current = transition.lastRepTimestamp;
      previousPoseStateRef.current = transition.nextPreviousPoseState;
      setCurrentPoseState(nextPoseState);

      if (transition.countedExercise) {
        const countKey = transition.countedExercise === "pushup" ? "pushups" : "squats";
        setSessionCounts((current) => ({
          ...current,
          [countKey]: current[countKey] + 1,
        }));
        onRepCounted(transition.countedExercise, countKey);
      }
    },
    [onRepCounted],
  );

  const resetSession = useCallback(() => {
    setSessionCounts({ pushups: 0, squats: 0 });
    setCurrentPoseState("unknown");
    previousPoseStateRef.current = "unknown";
    repStartedRef.current = false;
    repPeakAngleRef.current = null;
    repBottomAngleRef.current = null;
    lastRepTimestampRef.current = 0;
    poseStabilityRef.current = INITIAL_POSE_STABILITY_STATE;
  }, []);

  const resetTransition = useCallback(() => {
    setCurrentPoseState("unknown");
    previousPoseStateRef.current = "unknown";
    repStartedRef.current = false;
    repPeakAngleRef.current = null;
    repBottomAngleRef.current = null;
    poseStabilityRef.current = INITIAL_POSE_STABILITY_STATE;
  }, []);

  return {
    sessionCounts,
    currentPoseState,
    repStarted: repStartedRef.current,
    processPose,
    resetSession,
    resetTransition,
  };
}
