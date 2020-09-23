//
import { Faction } from "./faction";
import { Ship } from "./ship";

export { Randomizer } from "./randomizer";

function renderShip(lp: Ship) {
  var done = false;
  do {
    done = lp.addcomponent();
  } while (!done);
  lp.cfx.clearRect(lp.hw + (lp.w % 2), 0, lp.w, lp.h);
  lp.cfx.scale(-1, 1);
  lp.cfx.drawImage(lp.cf, 0 - lp.w, 0);
}

export function generateFaction(seed: string): Faction {
  return new Faction(seed);
}

export function generateShip(
  faction: Faction,
  seed: string,
  size?: number
): Ship {
  const newShip = new Ship(faction, seed, size);
  renderShip(newShip);
  // currentship.cf has the canvas with the image
  // currentship.width
  // currentship.height
  return newShip;
}
