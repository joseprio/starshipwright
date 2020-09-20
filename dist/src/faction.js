import { Randomizer } from "./randomizer";
import { clamp, hsvToRgb } from "./utils";
export class Faction {
    constructor(seed) {
        //Respective chances of each component
        this.componentChances = [];
        this.colors = [];
        this.colorChances = [];
        this.seed = seed;
        this.r = new Randomizer(this.seed);
        this.cache = {}; //Data cache.
        this.setupComponentChances();
        this.setupColors();
    }
    setupComponentChances() {
        this.componentChances = [];
        const dp = 8; //Default maximum power
        this.componentChances[0] =
            0.8 * this.r.sd(0.001, 1) * Math.pow(2, this.r.sd(0, dp));
        this.componentChances[1] =
            0.9 * this.r.sd(0.01, 1) * Math.pow(2, this.r.sd(0, dp));
        this.componentChances[2] =
            1 * this.r.sd(0.001, 1) * Math.pow(2, this.r.sd(0, dp));
        this.componentChances[3] =
            3 * this.r.sd(0, 1) * Math.pow(2, this.r.sd(0, dp));
        this.componentChances[4] =
            0.5 * this.r.sd(0, 1) * Math.pow(2, this.r.sd(0, dp));
        this.componentChances[5] =
            0.05 * this.r.sd(0, 1) * Math.pow(2, this.r.sd(0, dp));
        this.componentChances[6] =
            0.5 * this.r.sd(0, 1) * Math.pow(2, this.r.sd(0, dp));
    }
    setupColors() {
        const dp = 6; //Default maximum power.
        const baseColorCount = 1 +
            (this.r.hb(0.7, "base color +1") ? 1 : 0) +
            this.r.hseq(0.3, 3, "base color count");
        for (let i = 0; i < baseColorCount; i++) {
            const ls = "base color" + i;
            this.colors.push(hsvToRgb([
                Math.pow(this.r.hd(0, 1, ls + "hue"), 2),
                clamp(this.r.hd(-0.2, 1, ls + "saturation"), 0, Math.pow(this.r.hd(0, 1, ls + "saturation bound"), 4)),
                clamp(this.r.hd(0.7, 1.1, ls + "value"), 0, 1),
            ]));
            this.colorChances.push(Math.pow(2, this.r.hd(0, dp, ls + "chances")));
        }
    }
    //Where lp is the ship to get the color for.
    getBaseColor(lp) {
        let rv = this.colors[lp.r.schoose(this.colorChances)];
        if (true &&
            lp.r.sb(Math.pow(this.r.hd(0, 0.5, "base color shift chance"), 2))) {
            rv = [rv[0], rv[1], rv[2]];
            rv[0] = clamp(rv[0] +
                Math.pow(this.r.hd(0, 0.6, "base color shift range red"), 2) *
                    clamp(lp.r.sd(-1, 1.2), 0, 1) *
                    clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1), 0, 1);
            rv[1] = clamp(rv[1] +
                Math.pow(this.r.hd(0, 0.6, "base color shift range green"), 2) *
                    clamp(lp.r.sd(-1, 1.2), 0, 1) *
                    clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1), 0, 1);
            rv[2] = clamp(rv[2] +
                Math.pow(this.r.hd(0, 0.6, "base color shift range blue"), 2) *
                    clamp(lp.r.sd(-1, 1.2), 0, 1) *
                    clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1), 0, 1);
        }
        return rv;
    }
}
