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
    hr_xorshift(seed?: string): number;
    sd(min: number, max: number): number;
    hd(min: number, max: number, seed: string): number;
    si(min: number, max: number): number;
    hi(min: any, max: any, s: any): number;
    sb(chance: any): boolean;
    hb(chance: any, s: any): boolean;
    ss(chance: any): 1 | -1;
    hs(chance: number, seed: string): number;
    sseq(chance: number, max: number): number;
    hseq(chance: number, max: number, seed: string): number;
    schoose(chances: Array<number>): number;
    hchoose(chances: Array<number>, seed?: string): number;
}
