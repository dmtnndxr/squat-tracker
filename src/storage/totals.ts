import type { ExerciseTotals } from "../types/exercise";

export const STORAGE_KEY = "exercise_counter_totals";

export const EMPTY_TOTALS: ExerciseTotals = {
  pushups: 0,
  squats: 0,
};

function sanitizeTotals(value: unknown): ExerciseTotals {
  if (!value || typeof value !== "object") {
    return EMPTY_TOTALS;
  }

  const totals = value as Partial<ExerciseTotals>;

  return {
    pushups: typeof totals.pushups === "number" && Number.isFinite(totals.pushups) ? totals.pushups : 0,
    squats: typeof totals.squats === "number" && Number.isFinite(totals.squats) ? totals.squats : 0,
  };
}

export function loadTotals(storage: Storage = localStorage): ExerciseTotals {
  const raw = storage.getItem(STORAGE_KEY);

  if (!raw) {
    return { ...EMPTY_TOTALS };
  }

  try {
    return sanitizeTotals(JSON.parse(raw));
  } catch {
    return { ...EMPTY_TOTALS };
  }
}

export function saveTotals(totals: ExerciseTotals, storage: Storage = localStorage): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(sanitizeTotals(totals)));
}

export function resetTotals(storage: Storage = localStorage): ExerciseTotals {
  saveTotals(EMPTY_TOTALS, storage);
  return { ...EMPTY_TOTALS };
}
