import type { HSVColor, RGBColor } from "./types";
export declare function copyArray<T>(a: Array<T>, begin: number, end: number): Array<T>;
export declare function clamp(n: number, min: number, max: number): number;
export declare function colorToHex(color: RGBColor): string;
export declare function scaleColorBy(color: RGBColor, factor: number): RGBColor;
export declare function hsvToRgb(hsv: HSVColor): RGBColor;
