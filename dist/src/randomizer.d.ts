export declare class Randomizer {
    seed: string;
    stateArray: Array<number>;
    state: number;
    seedPosition: number;
    arrayPosition: number;
    hrCache: {
        [key: string]: number;
    };
    constructor(p_seed: string);
    sr(): number;
    hr(seed?: string): number;
    sd(min: number, max: number): number;
    hd(min: number, max: number, seed: string): number;
    si(min: number, max: number): number;
    hi(min: number, max: number, s: string): number;
    sb(chance: number): boolean;
    hb(chance: number, s: string): boolean;
    ss(chance: number): number;
    sseq(chance: number, max: number): number;
    hseq(chance: number, max: number, seed: string): number;
    schoose(chances: Array<number>): number;
    hchoose(chances: Array<number>, seed?: string): number;
}
