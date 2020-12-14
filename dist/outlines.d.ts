import { Ship } from "./ship";
declare type OutlineFunc = (lp: Ship, csx: CanvasRenderingContext2D) => void;
export declare const outlines: Array<OutlineFunc>;
export {};
