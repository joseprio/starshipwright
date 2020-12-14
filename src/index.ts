//
import { Ship } from "./ship";

import { Randomizer } from "./randomizer";

export { Randomizer } from "./randomizer";

function renderShip(lp: Ship) {
  lp.cfx.clearRect(lp.hw + (lp.w % 2), 0, lp.w, lp.h);
  lp.cfx.scale(-1, 1);
  lp.cfx.drawImage(lp.cf, 0 - lp.w, 0);
}

export function generateFactionRandomizer(seed: string): Randomizer {
  return new Randomizer(seed);
}

export function generateShip(
  factionRandomizer: Randomizer,
  seed: string,
  size?: number
): Ship {
  const newShip = new Ship(factionRandomizer, seed, size);
  renderShip(newShip);
  // currentship.cf has the canvas with the image
  // currentship.width
  // currentship.height
  return newShip;
}
