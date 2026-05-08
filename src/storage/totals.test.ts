import { beforeEach, describe, expect, it } from "vitest";
import { loadTotals, resetTotals, saveTotals, STORAGE_KEY } from "./totals";

describe("exercise totals storage", () => {
  let storage: Storage;

  beforeEach(() => {
    const values = new Map<string, string>();

    storage = {
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
  });

  it("returns empty totals when storage is missing", () => {
    expect(loadTotals(storage)).toEqual({ pushups: 0, squats: 0 });
  });

  it("saves and loads totals", () => {
    saveTotals({ pushups: 12, squats: 8 }, storage);

    expect(loadTotals(storage)).toEqual({ pushups: 12, squats: 8 });
  });

  it("falls back to empty totals for malformed JSON", () => {
    storage.setItem(STORAGE_KEY, "{bad json");

    expect(loadTotals(storage)).toEqual({ pushups: 0, squats: 0 });
  });

  it("resets totals", () => {
    saveTotals({ pushups: 12, squats: 8 }, storage);

    expect(resetTotals(storage)).toEqual({ pushups: 0, squats: 0 });
    expect(loadTotals(storage)).toEqual({ pushups: 0, squats: 0 });
  });
});
