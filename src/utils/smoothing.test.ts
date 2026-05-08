import { describe, expect, it } from "vitest";
import { appendWindowValue, averageWindow } from "./smoothing";

describe("smoothing", () => {
  it("keeps only the configured number of values", () => {
    expect(appendWindowValue([10, 20, 30], 40, 3)).toEqual([20, 30, 40]);
  });

  it("averages values in the window", () => {
    expect(averageWindow([100, 110, 120])).toBe(110);
  });

  it("returns null for an empty window", () => {
    expect(averageWindow([])).toBeNull();
  });
});
