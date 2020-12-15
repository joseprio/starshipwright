import { Randomizer } from "./randomizer";
declare type OutlineFunc = (shipRandomizer: Randomizer, factionRandomizer: Randomizer, w: number, h: number, hw: number, size: number, csx: CanvasRenderingContext2D) => void;
export declare const outlines: Array<OutlineFunc>;
export {};
