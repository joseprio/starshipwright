export declare class Randomizer {
    c: number;
    s0: number;
    s1: number;
    s2: number;
    hrCache: {
        [key: string]: number;
    };
    constructor(p_seed: string);
    sq(): number;
    hq(seed: string | number): number;
    sr(): number;
    hr(seed: string | number): number;
    sd(min: number, max: number): number;
    hd(min: number, max: number, seed: string | number): number;
    si(min: number, max: number): number;
    sb(chance: number): boolean;
    hi(min: number, max: number, seed: string | number): number;
    hb(chance: number, seed: string | number): boolean;
    ss(chance: number): number;
    sseq(chance: number, max: number): number;
    hseq(chance: number, max: number, seed: string | number): number;
    schoose(chances: Array<number>): number;
    hchoose(chances: Array<number>, seed: string | number): number;
}
