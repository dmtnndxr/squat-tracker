export function appendWindowValue(values: number[], value: number, windowSize: number): number[] {
  return [...values, value].slice(-windowSize);
}

export function averageWindow(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
