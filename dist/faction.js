export function computeFactionComponentChances(factionRandomizer) {
    const componentChances = [];
    const dp = 8; // Default maximum power
    // TODO: once we dont need backwards compatibility, we can probably simplify this file; the first argument of sd seems
    // unnecessary as we want to cherrypick ships anyways
    componentChances[0] =
        0.8 * factionRandomizer.sd(0.001, 1) * 2 ** factionRandomizer.sd(0, dp);
    componentChances[1] =
        0.9 * factionRandomizer.sd(0.01, 1) * 2 ** factionRandomizer.sd(0, dp);
    componentChances[2] =
        1 * factionRandomizer.sd(0.001, 1) * 2 ** factionRandomizer.sd(0, dp);
    componentChances[3] =
        3 * factionRandomizer.sd(0, 1) * 2 ** factionRandomizer.sd(0, dp);
    componentChances[4] =
        0.5 * factionRandomizer.sd(0, 1) * 2 ** factionRandomizer.sd(0, dp);
    componentChances[5] =
        0.05 * factionRandomizer.sd(0, 1) * 2 ** factionRandomizer.sd(0, dp);
    componentChances[6] =
        0.5 * factionRandomizer.sd(0, 1) * 2 ** factionRandomizer.sd(0, dp);
    return componentChances;
}
