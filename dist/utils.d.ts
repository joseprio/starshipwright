import type { RGBColor } from "./types";
export declare function clamp(n: number, min: number, max: number): number;
export declare function scaleColorBy(color: RGBColor, factor: number): string;
export declare function hsvToRgb(h: number, s: number, v: number): RGBColor;
declare type RandomNumberGenerator = () => number;
export declare function numberBetween(target: number, a: number, b: number): number;
export declare function integerNumberBetween(target: number, a: number, b: number): number;
export declare function sequenceAdvancer(generator: RandomNumberGenerator, chance: number, max: number): number;
export declare function chancePicker(generator: RandomNumberGenerator, chances: Array<number>): number;
export declare function createNumberGenerator(seed: number): RandomNumberGenerator;
export {};
