import { Randomizer } from "./randomizer";
import type { RGBColor } from "./types";

export type ComponentChances = Array<number>;
export type ColorData = [Array<RGBColor>, Array<number>];

export function computeFactionComponentChances(factionRandomizer: Randomizer): ComponentChances {
  const componentChances = [];
  const dp = 8; // Default maximum power
  // TODO: once we dont need backwards compatibility, we can probably simplify this file; the first argument of sd seems
  // unnecessary
  componentChances[0] =
    0.8 * factionRandomizer.sd(0.001, 1) * (2 ** factionRandomizer.sd(0, dp));
  componentChances[1] =
    0.9 * factionRandomizer.sd(0.01, 1) * (2 ** factionRandomizer.sd(0, dp));
  componentChances[2] =
    1 * factionRandomizer.sd(0.001, 1) * (2 ** factionRandomizer.sd(0, dp));
  componentChances[3] =
    3 * factionRandomizer.sd(0, 1) * (2 ** factionRandomizer.sd(0, dp));
  componentChances[4] =
    0.5 * factionRandomizer.sd(0, 1) * (2 ** factionRandomizer.sd(0, dp));
  componentChances[5] =
    0.05 * factionRandomizer.sd(0, 1) * (2 ** factionRandomizer.sd(0, dp));
  componentChances[6] =
    0.5 * factionRandomizer.sd(0, 1) * (2 ** factionRandomizer.sd(0, dp));
  return componentChances;
}



  //Where lp is the ship to get the color for
  /*
  getwindowcolor(lp) {
    if (this.cache["window colors"] == null) {
      const dp = 5; //Default maximum power.
      this.cache["window color count"] =
        1 + (this.r.hb(0.3, "window color +1") ? 1 : 0);
      this.cache["window colors"] = new Array(this.cache["window color count"]);
      this.cache["window color chances"] = new Array(
        this.cache["window color count"]
      );
      for (let i = 0; i < this.cache["window color count"]; i++) {
        const ls = "window color" + i;
        this.cache["window colors"][i] = hsvToRgb([
          this.r.hb(0.6, "window color blues only")
            ? this.r.hd(1 / 3, 3 / 4, "window color blue hue")
            : this.r.hd(0, 1, "window color hue"),
          Math.pow(
            clamp(this.r.hd(-0.2, 1.2, "window color hue"), 0, 1),
            0.5
          ),
          Math.pow(
            clamp(this.r.hd(0.4, 1.3, "window color value"), 0, 1),
            0.5
          ),
        ]);
        this.cache["window color chances"][i] = Math.pow(
          2,
          this.r.hd(0, dp, ls + "chances")
        );
      }
    }
    const rv = this.cache["window colors"][
      lp.r.schoose(this.cache["window color chances"])
    ];
    return rv;
  }
  */

