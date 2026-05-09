import type { ExerciseType } from "../types/exercise";

export const HISTORY_STORAGE_KEY = "exercise_counter_rep_history_v1";

export type RepHistoryEntry = {
  id: string;
  exercise: ExerciseType;
  timestamp: string;
  sessionId: string;
};

function sanitizeHistory(value: unknown): RepHistoryEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is RepHistoryEntry => {
    if (!entry || typeof entry !== "object") {
      return false;
    }

    const candidate = entry as Partial<RepHistoryEntry>;
    return (
      typeof candidate.id === "string" &&
      (candidate.exercise === "pushup" || candidate.exercise === "squat") &&
      typeof candidate.timestamp === "string" &&
      typeof candidate.sessionId === "string"
    );
  });
}

export function loadHistory(storage: Storage = localStorage): RepHistoryEntry[] {
  const raw = storage.getItem(HISTORY_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return sanitizeHistory(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveHistory(history: RepHistoryEntry[], storage: Storage = localStorage): void {
  storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(sanitizeHistory(history)));
}

export function appendHistoryEntry(
  entry: RepHistoryEntry,
  storage: Storage = localStorage,
): RepHistoryEntry[] {
  const next = [...loadHistory(storage), entry];
  saveHistory(next, storage);
  return next;
}

export function resetHistory(storage: Storage = localStorage): RepHistoryEntry[] {
  saveHistory([], storage);
  return [];
}

export function historyToCsv(history: RepHistoryEntry[]): string {
  const rows = ["timestamp,exercise,sessionId"];

  for (const entry of history) {
    rows.push([entry.timestamp, entry.exercise, entry.sessionId].map(csvEscape).join(","));
  }

  return rows.join("\n");
}

function csvEscape(value: string): string {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}

export function createHistoryEntry(exercise: ExerciseType, sessionId: string): RepHistoryEntry {
  const timestamp = new Date().toISOString();

  return {
    id: `${timestamp}-${exercise}-${crypto.randomUUID()}`,
    exercise,
    timestamp,
    sessionId,
  };
}
