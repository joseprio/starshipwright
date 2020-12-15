import { Randomizer } from "./randomizer";
declare type Cell = {
    gx: number;
    gy: number;
    x: number;
    y: number;
    phase: number;
};
export declare class Ship {
    f: Randomizer;
    r: Randomizer;
    size: number;
    w: number;
    hw: number;
    gw: number;
    gwextra: number;
    h: number;
    hh: number;
    gh: number;
    ghextra: number;
    cf: HTMLCanvasElement;
    cgrid: Array<Array<Cell>>;
    constructor(factionRandomizer: Randomizer, p_seed: string, size?: number);
    getCellPhase(x: number, y: number): number;
}
export {};
