import type { HSVColor, RGBColor } from "./types";

export function copyArray<T>(
  a: Array<T>,
  begin: number,
  end: number
): Array<T> {
  const rv = new Array(end - begin);
  for (let i = end; i >= begin; i--) {
    rv[i - begin] = a[i];
  }
  return rv;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function hexpad(n: number, l: number): string {
  //For integer n and length l.
  var s = Math.floor(n).toString(16);
  while (s.length < l) {
    s = "0" + s;
  }
  return s;
}

export function colorToHex(color: RGBColor): string {
  return (
    "#" +
    hexpad(Math.floor(clamp(color[0], 0, 1) * 255), 2) +
    (hexpad(Math.floor(clamp(color[1], 0, 1) * 255), 2) +
      hexpad(Math.floor(clamp(color[2], 0, 1) * 255), 2))
  );
}

// Take a color and multiplies it with a factor. factor = 0 produces black.
export function scaleColorBy(color: RGBColor, factor: number): RGBColor {
  return [color[0] * factor, color[1] * factor, color[2] * factor];
}

// Takes a triplet [H,S,V] and returns a triplet [R,G,B], representing the same color. All components are 0 - 1.
export function hsvToRgb(hsv: HSVColor): RGBColor {
  var c = hsv[1] * hsv[2];
  var m = hsv[2] - c;
  var h = ((hsv[0] % 1) + 1) % 1;
  var hrel = 6 * h;
  var hseg = Math.floor(hrel);
  var x = c * (1 - Math.abs((hrel % 2) - 1));
  switch (hseg) {
    case 0:
      return [c + m, x + m, m];
    case 1:
      return [x + m, c + m, m];
    case 2:
      return [m, c + m, x + m];
    case 3:
      return [m, x + m, c + m];
    case 4:
      return [x + m, m, c + m];
    default:
      return [c + m, m, x + m];
  }
}
