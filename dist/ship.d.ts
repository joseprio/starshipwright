import { Randomizer } from "./randomizer";
export declare class Ship {
    f: Randomizer;
    r: Randomizer;
    size: number;
    w: number;
    hw: number;
    gwextra: number;
    h: number;
    hh: number;
    ghextra: number;
    cf: HTMLCanvasElement;
    constructor(factionRandomizer: Randomizer, p_seed: string, size?: number);
}
