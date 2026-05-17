import { describe, expect, it } from "vitest";
import { getAdaptiveThresholds } from "./landmarks";

describe("getAdaptiveThresholds", () => {
  it("keeps default squat thresholds until the observed movement range is large enough", () => {
    expect(getAdaptiveThresholds("squat", { min: 130, max: 168 })).toEqual({
      up: 160,
      down: 100,
      source: "default",
    });
  });

  it("clamps adaptive squat thresholds to conservative bounds", () => {
    expect(getAdaptiveThresholds("squat", { min: 75, max: 178 })).toEqual({
      down: 105.9,
      up: 155.34,
      source: "adaptive",
    });
  });
});
