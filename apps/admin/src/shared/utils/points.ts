export function nairaToPoints(amountNaira: number, nairaPerPoint: number): number {
  if (nairaPerPoint <= 0) return 0;
  return Math.floor(amountNaira / nairaPerPoint);
}

export function formatPoints(value: number, zeroFallback?: string): string {
  if (value === 0 && zeroFallback !== undefined) return zeroFallback;
  return `${value} PT`;
}
