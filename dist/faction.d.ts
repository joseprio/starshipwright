import { Randomizer } from "./randomizer";
import type { RGBColor } from "./types";
export declare type ComponentChances = Array<number>;
export declare type ColorData = [Array<RGBColor>, Array<number>];
export declare function computeFactionComponentChances(factionRandomizer: Randomizer): ComponentChances;
export declare function computeFactionColors(factionRandomizer: Randomizer): ColorData;
