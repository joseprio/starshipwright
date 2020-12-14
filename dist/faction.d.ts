import { Randomizer } from "./randomizer";
import type { RGBColor } from "./types";
import type { Ship } from "./ship";
export declare type ComponentChances = Array<number>;
export declare type ColorData = [Array<RGBColor>, Array<number>];
export declare function computeFactionComponentChances(factionRandomizer: Randomizer): ComponentChances;
export declare function computeFactionColors(factionRandomizer: Randomizer): ColorData;
export declare function computeBaseColor(factionRandomizer: Randomizer, factionColorData: ColorData, lp: Ship): RGBColor;
