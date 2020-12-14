//
import { Ship } from "./ship";

import { Randomizer } from "./randomizer";

export { Randomizer } from "./randomizer";

export function generateFactionRandomizer(seed: string): Randomizer {
  return new Randomizer(seed);
}

export function generateShip(
  factionRandomizer: Randomizer,
  seed: string,
  size?: number
): Ship {
  const newShip = new Ship(factionRandomizer, seed, size);
  // currentship.cf has the canvas with the image
  // currentship.width
  // currentship.height
  return newShip;
}
