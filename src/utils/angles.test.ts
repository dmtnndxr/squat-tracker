import { describe, expect, it } from "vitest";
import { calculateAngle } from "./angles";

describe("calculateAngle", () => {
  it("returns 180 degrees for a straight joint", () => {
    expect(calculateAngle({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 })).toBeCloseTo(180);
  });

  it("returns 90 degrees for a right angle", () => {
    expect(calculateAngle({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 })).toBeCloseTo(90);
  });

  it("returns 0 for a zero-length vector", () => {
    expect(calculateAngle({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 })).toBe(0);
  });
});
