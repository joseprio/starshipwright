import type { Ship } from "./ship";
import type { Vec } from "./types";
import type { ComponentChances, ColorData } from "./faction";
declare type ComponentFunc = (cfx: CanvasRenderingContext2D, lp: Ship, v: Vec, componentChances: ComponentChances, colorData: ColorData, nextpass: number) => void;
export declare const components: Array<ComponentFunc>;
export {};
