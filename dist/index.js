//
import { Ship } from "./ship";
import { Randomizer } from "./randomizer";
export { Randomizer } from "./randomizer";
function renderShip(lp) {
    lp.cfx.clearRect(lp.hw + (lp.w % 2), 0, lp.w, lp.h);
    lp.cfx.scale(-1, 1);
    lp.cfx.drawImage(lp.cf, 0 - lp.w, 0);
}
export function generateFactionRandomizer(seed) {
    return new Randomizer(seed);
}
export function generateShip(factionRandomizer, seed, size) {
    const newShip = new Ship(factionRandomizer, seed, size);
    renderShip(newShip);
    // currentship.cf has the canvas with the image
    // currentship.width
    // currentship.height
    return newShip;
}
