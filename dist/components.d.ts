import type { Ship } from "./ship";
import type { Vec } from "./types";
import type { ComponentChances, ColorData } from "./faction";
declare type ComponentFunc = (lp: Ship, v: Vec, componentChances: ComponentChances, colorData: ColorData) => void;
export declare const components: Array<ComponentFunc>;
export {};
