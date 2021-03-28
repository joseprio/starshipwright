import type { RGBColor } from "./types";

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// Take a color and multiplies it with a factor. factor = 0 produces black.
export function scaleColorBy(color: RGBColor, factor: number): string {
  return `rgb(${color.map((channel) => channel * factor * 100).join("%,")}%)`;
}

// Takes a triplet [H,S,V] and returns a triplet [R,G,B], representing the same color. All components are 0 - 1.
export function hsvToRgb(h: number, s: number, v: number): RGBColor {
  const f: (n: number, k?: number) => number = (n, k = (n + h * 6) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return [f(5), f(3), f(1)];
}

type RandomNumberGenerator = () => number;

// Converts a number between 0 and 1 to a number between [a, b)
export function numberBetween(target: number, a: number, b: number): number {
  return target * (b - a) + a;
}

// Converts a number between 0 and 1 to an integer number between [a,b] (both included)
export function integerNumberBetween(
  target: number,
  a: number,
  b: number
): number {
  return Math.floor(numberBetween(target, a, b + 1));
}

export function sequenceAdvancer(
  generator: RandomNumberGenerator,
  chance: number,
  max: number
): number {
  let rv = 0;
  while (generator() < chance && rv < max) {
    rv++;
  }
  return rv;
}

export function chancePicker(
  generator: RandomNumberGenerator,
  chances: Array<number>
): number {
  let sum = 0;
  for (let i = 0; i < chances.length; i++) {
    sum += chances[i];
  }
  let which = generator() * sum;
  for (let i = 0; i < chances.length; i++) {
    which -= chances[i];
    if (which <= 0) {
      return i;
    }
  }
  // We know we already returned at this point
}

export function createNumberGenerator(seed: number): RandomNumberGenerator {
  const ints = new Uint32Array([
    Math.imul(seed, 0x85ebca6b),
    Math.imul(seed, 0xc2b2ae35),
  ]);

  return () => {
    const s0 = ints[0];
    const s1 = ints[1] ^ s0;
    ints[0] = ((s0 << 26) | (s0 >> 8)) ^ s1 ^ (s1 << 9);
    ints[1] = (s1 << 13) | (s1 >> 19);
    return (Math.imul(s0, 0x9e3779bb) >>> 0) / 0xffffffff;
  };
}
