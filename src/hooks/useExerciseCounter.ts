import { useCallback, useRef, useState } from "react";
import type { ExerciseType, PoseEvaluation, PoseState } from "../types/exercise";
import { applyCounterTransition } from "../utils/counter";

export type SessionCounts = {
  pushups: number;
  squats: number;
};

export function useExerciseCounter(onRepCounted: (exercise: keyof SessionCounts) => void) {
  const [sessionCounts, setSessionCounts] = useState<SessionCounts>({ pushups: 0, squats: 0 });
  const [currentPoseState, setCurrentPoseState] = useState<PoseState>("unknown");
  const previousPoseStateRef = useRef<PoseState>("unknown");
  const repStartedRef = useRef(false);
  const lastRepTimestampRef = useRef(0);

  const processPose = useCallback(
    (exercise: ExerciseType, evaluation: PoseEvaluation) => {
      const nextPoseState = evaluation.poseState;
      const previousPoseState = previousPoseStateRef.current;

      const transition = applyCounterTransition({
        exercise,
        previousPoseState,
        currentPoseState: nextPoseState,
        repStarted: repStartedRef.current,
        hasObservedUp: evaluation.hasObservedUp,
        now: Date.now(),
        lastRepTimestamp: lastRepTimestampRef.current,
      });

      repStartedRef.current = transition.repStarted;
      lastRepTimestampRef.current = transition.lastRepTimestamp;
      previousPoseStateRef.current = transition.nextPreviousPoseState;
      setCurrentPoseState(nextPoseState);

      if (transition.countedExercise) {
        const countKey = transition.countedExercise === "pushup" ? "pushups" : "squats";
        setSessionCounts((current) => ({
          ...current,
          [countKey]: current[countKey] + 1,
        }));
        onRepCounted(countKey);
      }
    },
    [onRepCounted],
  );

  const resetSession = useCallback(() => {
    setSessionCounts({ pushups: 0, squats: 0 });
    setCurrentPoseState("unknown");
    previousPoseStateRef.current = "unknown";
    repStartedRef.current = false;
    lastRepTimestampRef.current = 0;
  }, []);

  const resetTransition = useCallback(() => {
    setCurrentPoseState("unknown");
    previousPoseStateRef.current = "unknown";
    repStartedRef.current = false;
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
