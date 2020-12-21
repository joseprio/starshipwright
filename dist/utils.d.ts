import type { RGBColor } from "./types";
export declare function clamp(n: number, min: number, max: number): number;
export declare function scaleColorBy(color: RGBColor, factor: number): string;
export declare function hsvToRgb(h: number, s: number, v: number): RGBColor;
