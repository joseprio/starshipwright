import type { Vec } from "./types";
import type { ComponentChances, ColorData } from "./faction";
import { Randomizer } from "./randomizer";
declare type ComponentFunc = (cfx: CanvasRenderingContext2D, shipRandomizer: Randomizer, factionRandomizer: Randomizer, w: number, h: number, hw: number, hh: number, size: number, v: Vec, componentChances: ComponentChances, colorData: ColorData, nextpass: number, totaldone: number, totalcomponents: number, getCellPhase: (x: number, y: number) => number) => void;
export declare const components: Array<ComponentFunc>;
export {};
