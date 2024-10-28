import type { RGBColor } from "./types";
import type { RandomNumberGenerator } from "game-utils";
export declare function clamp(n: number, min: number, max: number): number;
export declare function scaleColorBy(color: RGBColor, factor: number): string;
export declare function hsvToRgb(h: number, s: number, v: number): RGBColor;
export declare function sequenceAdvancer(generator: RandomNumberGenerator, chance: number, max: number): number;
export declare function chancePicker(generator: RandomNumberGenerator, chances: Array<number>): number;
