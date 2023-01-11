export function enhancedDivision(dividend?: number, divisor?: number) {
  if (!divisor || !dividend) {
    return 0
  }
  return dividend / divisor
}
