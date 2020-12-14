import { Randomizer } from "./randomizer";
import { ColorData, ComponentChances } from "./faction";
declare type Cell = {
    gx: number;
    gy: number;
    x: number;
    y: number;
    phase: number;
};
export declare class Ship {
    f: Randomizer;
    baseSeed: string;
    seed: string;
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
    cs: HTMLCanvasElement;
    csx: CanvasRenderingContext2D;
    cf: HTMLCanvasElement;
    cfx: CanvasRenderingContext2D;
    passes: number;
    extra: number;
    extradone: number;
    nextpass: number;
    nextcell: number;
    totalcomponents: number;
    totaldone: number;
    cgrid: Array<Array<Cell>>;
    goodcells: Array<Cell>;
    csd: ImageData;
    constructor(factionRandomizer: Randomizer, p_seed: string, size?: number);
    getcell(x: number, y: number): Cell;
    getCellPhase(x: number, y: number): number;
    getspa(x: number, y: number): number;
    getpcdone(): number;
    addcomponent(componentChances: ComponentChances, colorData: ColorData): boolean;
}
export {};
