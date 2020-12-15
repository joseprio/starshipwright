import { Randomizer } from "./randomizer";
export { Randomizer } from "./randomizer";
export declare function generateFactionRandomizer(seed: string): Randomizer;
export declare function generateShip(factionRandomizer: Randomizer, seed: string, size?: number): HTMLCanvasElement;
