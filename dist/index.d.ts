import { Faction } from "./faction";
import { Ship } from "./ship";
export { Randomizer } from "./randomizer";
export declare function generateFaction(seed?: string): Faction;
export declare function generateShip(faction: Faction, seed?: string, size?: number): Ship;
