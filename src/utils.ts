import type { RGBColor } from "./types";
import type { RandomNumberGenerator } from "game-utils";

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

