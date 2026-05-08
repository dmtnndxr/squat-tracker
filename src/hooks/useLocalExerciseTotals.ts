import { useCallback, useEffect, useState } from "react";
import type { ExerciseTotals } from "../types/exercise";
import { EMPTY_TOTALS, loadTotals, resetTotals, saveTotals } from "../storage/totals";

export function useLocalExerciseTotals() {
  const [totals, setTotals] = useState<ExerciseTotals>(EMPTY_TOTALS);

  useEffect(() => {
    setTotals(loadTotals());
  }, []);

  const incrementTotal = useCallback((exercise: keyof ExerciseTotals) => {
    setTotals((current) => {
      const next = {
        ...current,
        [exercise]: current[exercise] + 1,
      };

      saveTotals(next);
      return next;
    });
  }, []);

  const resetLocalTotals = useCallback(() => {
    setTotals(resetTotals());
  }, []);

  return {
    totals,
    incrementTotal,
    resetLocalTotals,
  };
}
