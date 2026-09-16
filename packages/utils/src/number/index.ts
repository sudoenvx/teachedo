export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number, decimals = 2): number {
  return round(Math.random() * (max - min) + min, decimals);
}

export function toPercentage(value: number, total: number, decimals = 0): number {
  if (total === 0) return 0;
  return round((value / total) * 100, decimals);
}

export function isBetween(value: number, min: number, max: number, inclusive = true): boolean {
  return inclusive ? value >= min && value <= max : value > min && value < max;
}

export function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

export function average(numbers: number[]): number {
  return numbers.length ? sum(numbers) / numbers.length : 0;
}

export function ordinalSuffix(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

export function toFixedNumber(value: number, decimals = 2): number {
  return Number(value.toFixed(decimals));
}