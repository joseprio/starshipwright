import type { HSVColor, RGBColor } from "./types";
export declare function clamp(n: number, min: number, max: number): number;
export declare function colorToHex(color: RGBColor): string;
export declare function scaleColorBy(color: RGBColor, factor: number): string;
export declare function hsvToRgb(hsv: HSVColor): RGBColor;
