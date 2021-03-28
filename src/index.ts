//
import { buildShip } from "./ship";

export function generateShip(
  factionSeed: number,
  seed: number,
  size?: number
): HTMLCanvasElement {
  return buildShip(factionSeed, seed, size);
}
