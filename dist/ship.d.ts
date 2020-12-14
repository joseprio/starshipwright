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
    passes: number;
    extra: number;
    totalcomponents: number;
    totaldone: number;
    cgrid: Array<Array<Cell>>;
    constructor(factionRandomizer: Randomizer, p_seed: string, size?: number);
    getCellPhase(x: number, y: number): number;
    getpcdone(): number;
    addComponents(cfx: CanvasRenderingContext2D, componentChances: ComponentChances, colorData: ColorData, goodcells: Array<Cell>, outline: ImageData): void;
}
export {};
