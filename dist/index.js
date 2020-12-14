//
import { Ship } from "./ship";
import { Randomizer } from "./randomizer";
export { Randomizer } from "./randomizer";
export function generateFactionRandomizer(seed) {
    return new Randomizer(seed);
}
export function generateShip(factionRandomizer, seed, size) {
    const newShip = new Ship(factionRandomizer, seed, size);
    // currentship.cf has the canvas with the image
    // currentship.width
    // currentship.height
    return newShip;
}
