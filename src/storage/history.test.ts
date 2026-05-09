import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  appendHistoryEntry,
  createHistoryEntry,
  historyToCsv,
  loadHistory,
  resetHistory,
  saveHistory,
  type RepHistoryEntry,
} from "./history";

function createStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

describe("rep history storage", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createStorage();
  });

  it("loads empty history for missing or malformed storage", () => {
    expect(loadHistory(storage)).toEqual([]);

    storage.setItem("exercise_counter_rep_history_v1", "{bad json");

    expect(loadHistory(storage)).toEqual([]);
  });

  it("saves and appends history entries", () => {
    const entry: RepHistoryEntry = {
      id: "1",
      exercise: "squat",
      timestamp: "2026-05-09T00:00:00.000Z",
      sessionId: "session-1",
    };

    saveHistory([entry], storage);
    appendHistoryEntry({ ...entry, id: "2", exercise: "pushup" }, storage);

    expect(loadHistory(storage)).toHaveLength(2);
  });

  it("exports CSV with escaped values", () => {
    expect(
      historyToCsv([
        {
          id: "1",
          exercise: "squat",
          timestamp: "2026-05-09T00:00:00.000Z",
          sessionId: 'session,"1"',
        },
      ]),
    ).toBe('timestamp,exercise,sessionId\n2026-05-09T00:00:00.000Z,squat,"session,""1"""');
  });

  it("resets history", () => {
    appendHistoryEntry(
      {
        id: "1",
        exercise: "squat",
        timestamp: "2026-05-09T00:00:00.000Z",
        sessionId: "session-1",
      },
      storage,
    );

    expect(resetHistory(storage)).toEqual([]);
    expect(loadHistory(storage)).toEqual([]);
  });

  it("creates entries with an ISO timestamp and session id", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-09T10:30:00.000Z"));
    vi.spyOn(crypto, "randomUUID").mockReturnValue("00000000-0000-4000-8000-000000000000");

    expect(createHistoryEntry("pushup", "session-1")).toEqual({
      id: "2026-05-09T10:30:00.000Z-pushup-00000000-0000-4000-8000-000000000000",
      exercise: "pushup",
      timestamp: "2026-05-09T10:30:00.000Z",
      sessionId: "session-1",
    });

    vi.useRealTimers();
  });
});
