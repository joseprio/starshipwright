import { Randomizer } from "./randomizer";

export type ComponentChances = Array<number>;

export function computeFactionComponentChances(
  factionRandomizer: Randomizer
): ComponentChances {
  const dp = 8; // Default maximum power
  // TODO: once we dont need backwards compatibility, we can probably simplify this file; the first argument of sd seems
  // unnecessary as we want to cherrypick ships anyways
  return [
    0.8 * factionRandomizer.sd(0.001, 1) * 2 ** factionRandomizer.sd(0, dp),
    0.9 * factionRandomizer.sd(0.01, 1) * 2 ** factionRandomizer.sd(0, dp),
    1 * factionRandomizer.sd(0.001, 1) * 2 ** factionRandomizer.sd(0, dp),
    3 * factionRandomizer.sd(0, 1) * 2 ** factionRandomizer.sd(0, dp),
    0.5 * factionRandomizer.sd(0, 1) * 2 ** factionRandomizer.sd(0, dp),
    0.05 * factionRandomizer.sd(0, 1) * 2 ** factionRandomizer.sd(0, dp),
    0.5 * factionRandomizer.sd(0, 1) * 2 ** factionRandomizer.sd(0, dp)
  ];
}
