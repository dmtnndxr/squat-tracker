import type { Point } from "../types/exercise";

export function calculateAngle(a: Point, b: Point, c: Point): number {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };

  const dot = ab.x * cb.x + ab.y * cb.y;
  const abMagnitude = Math.hypot(ab.x, ab.y);
  const cbMagnitude = Math.hypot(cb.x, cb.y);

  if (abMagnitude === 0 || cbMagnitude === 0) {
    return 0;
  }

  const cosine = dot / (abMagnitude * cbMagnitude);
  const clamped = Math.min(1, Math.max(-1, cosine));

  return (Math.acos(clamped) * 180) / Math.PI;
}

export function average(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
