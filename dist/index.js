//
import { buildShip } from "./ship";
export { numberBetween, integerNumberBetween, createNumberGenerator, } from "./utils";
export function generateShip(factionSeed, seed, size) {
    return buildShip(factionSeed, seed, size);
}
