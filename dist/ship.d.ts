import { Randomizer } from "./randomizer";
export declare class Ship {
    f: Randomizer;
    r: Randomizer;
    size: number;
    w: number;
    hw: number;
    h: number;
    hh: number;
    cf: HTMLCanvasElement;
    constructor(factionRandomizer: Randomizer, p_seed: string, size?: number);
}
