//
import { buildShip } from "./ship";

import { Randomizer } from "./randomizer";

export { Randomizer } from "./randomizer";

export function generateFactionRandomizer(seed: string): Randomizer {
  return new Randomizer(seed);
}

export function generateShip(
  factionRandomizer: Randomizer,
  seed: string,
  size?: number
): HTMLCanvasElement {
  return buildShip(factionRandomizer, seed, size);
}
