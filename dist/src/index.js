//
import { Faction } from "./faction";
import { Ship } from "./ship";
export { Randomizer } from "./randomizer";
const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const DEFAULT_SEED_LENGTH = 16;
// min and max included
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function randomSeed() {
    var s = "";
    for (var c = 0; c < DEFAULT_SEED_LENGTH; c++) {
        s = s + characters[randomIntFromInterval(0, characters.length - 1)];
    }
    return s;
}
function renderShip(lp) {
    var done = false;
    do {
        done = lp.addcomponent();
    } while (!done);
    lp.cfx.clearRect(lp.hw + (lp.w % 2), 0, lp.w, lp.h);
    lp.cfx.scale(-1, 1);
    lp.cfx.drawImage(lp.cf, 0 - lp.w, 0);
}
export function generateFaction(seed) {
    return new Faction(seed || randomSeed());
}
export function generateShip(faction, seed, size) {
    const newShip = new Ship(faction, seed || randomSeed(), size);
    renderShip(newShip);
    // currentship.cf has the canvas with the image
    // currentship.width
    // currentship.height
    return newShip;
}
