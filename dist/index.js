//
import { buildShip } from "./ship";
import { Randomizer } from "./randomizer";
export { Randomizer } from "./randomizer";
export function generateFactionRandomizer(seed) {
    return new Randomizer(seed);
}
export function generateShip(factionRandomizer, seed, size) {
    return buildShip(factionRandomizer, seed, size);
}
