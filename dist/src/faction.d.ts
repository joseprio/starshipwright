import { Randomizer } from "./randomizer";
import type { RGBColor } from "./types";
import type { Ship } from "./ship";
export declare class Faction {
    seed: string;
    r: Randomizer;
    componentChances: Array<number>;
    colors: Array<RGBColor>;
    colorChances: Array<number>;
    constructor(seed: string);
    setupComponentChances(): void;
    setupColors(): void;
    getBaseColor(lp: Ship): RGBColor;
}
