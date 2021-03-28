//
import { buildShip } from "./ship";

export {
  numberBetween,
  integerNumberBetween,
  createNumberGenerator,
} from "./utils";

export function generateShip(
  factionSeed: number,
  seed: number,
  size?: number
): HTMLCanvasElement {
  return buildShip(factionSeed, seed, size);
}
