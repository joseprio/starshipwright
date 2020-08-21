import { Randomizer } from "./randomizer";
import { clamp, hsvToRgb } from "./utils";

export class Faction {
  seed: string;
  randomizer: Randomizer;
  cache: Object;
  componentChances: Array<number>;

  constructor(seed: string) {
    this.seed = seed;
    this.randomizer = new Randomizer(this.seed);
    this.cache = {}; //Data cache.
    this.setupComponentChances();
  }

  setupComponentChances() {
    this.componentChances = []; //Respective chances of each component.
    var dp = 8; //Default maximum power.
    this.componentChances[0] =
      0.8 *
      this.randomizer.sd(0.001, 1) *
      Math.pow(2, this.randomizer.sd(0, dp));
    this.componentChances[1] =
      0.9 *
      this.randomizer.sd(0.01, 1) *
      Math.pow(2, this.randomizer.sd(0, dp));
    this.componentChances[2] =
      1 * this.randomizer.sd(0.001, 1) * Math.pow(2, this.randomizer.sd(0, dp));
    this.componentChances[3] =
      3 * this.randomizer.sd(0, 1) * Math.pow(2, this.randomizer.sd(0, dp));
    this.componentChances[4] =
      0.5 * this.randomizer.sd(0, 1) * Math.pow(2, this.randomizer.sd(0, dp));
    this.componentChances[5] =
      0.05 * this.randomizer.sd(0, 1) * Math.pow(2, this.randomizer.sd(0, dp));
    this.componentChances[6] =
      0.5 * this.randomizer.sd(0, 1) * Math.pow(2, this.randomizer.sd(0, dp));
  }

  setupColors() {
    if (this.cache["base colors"] == null) {
      var dp = 6; //Default maximum power.
      this.cache["base color count"] =
        1 +
        (this.randomizer.hb(0.7, "base color +1") ? 1 : 0) +
        this.randomizer.hseq(0.3, 3, "base color count");
      this.cache["base colors"] = new Array(this.cache["base color count"]);
      this.cache["base color chances"] = new Array(
        this.cache["base color count"]
      );
      for (var i = 0; i < this.cache["base color count"]; i++) {
        var ls = "base color" + i;
        this.cache["base colors"][i] = hsvToRgb([
          Math.pow(this.randomizer.hd(0, 1, ls + "hue"), 2),
          clamp(
            this.randomizer.hd(-0.2, 1, ls + "saturation"),
            0,
            Math.pow(this.randomizer.hd(0, 1, ls + "saturation bound"), 4)
          ),
          clamp(this.randomizer.hd(0.7, 1.1, ls + "value"), 0, 1),
        ]);
        this.cache["base color chances"][i] = Math.pow(
          2,
          this.randomizer.hd(0, dp, ls + "chances")
        );
      }
    }
    if (this.cache["window colors"] == null) {
      var dp = 5; //Default maximum power.
      this.cache["window color count"] =
        1 + (this.randomizer.hb(0.3, "window color +1") ? 1 : 0);
      this.cache["window colors"] = new Array(this.cache["window color count"]);
      this.cache["window color chances"] = new Array(
        this.cache["window color count"]
      );
      for (var i = 0; i < this.cache["window color count"]; i++) {
        var ls = "window color" + i;
        this.cache["window colors"][i] = hsvToRgb([
          this.randomizer.hb(0.6, "window color blues only")
            ? this.randomizer.hd(1 / 3, 3 / 4, "window color blue hue")
            : this.randomizer.hd(0, 1, "window color hue"),
          Math.pow(
            clamp(this.randomizer.hd(-0.2, 1.2, "window color hue"), 0, 1),
            0.5
          ),
          Math.pow(
            clamp(this.randomizer.hd(0.4, 1.3, "window color value"), 0, 1),
            0.5
          ),
        ]);
        this.cache["window color chances"][i] = Math.pow(
          2,
          this.randomizer.hd(0, dp, ls + "chances")
        );
      }
    }
  }

  //Where lp is the ship to get the color for.
  getBaseColor(lp) {
    if (this.cache["base colors"] == null) {
      this.setupColors();
    }
    var rv = this.cache["base colors"][
      lp.r.schoose(this.cache["base color chances"])
    ];
    if (
      true &&
      lp.r.sb(
        this.cache["base color shift chance"] == null
          ? (this.cache["base color shift chance"] = Math.pow(
              this.randomizer.hd(0, 0.5, "base color shift chance"),
              2
            ))
          : this.cache["base color shift chance"]
      )
    ) {
      rv = [rv[0], rv[1], rv[2]];
      rv[0] = clamp(
        rv[0] +
          (this.cache["base color shift range red"] == null
            ? (this.cache["base color shift range red"] = Math.pow(
                this.randomizer.hd(0, 0.6, "base color shift range red"),
                2
              ))
            : this.cache["base color shift range red"]) *
            clamp(lp.r.sd(-1, 1.2), 0, 1) *
            clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1),
        0,
        1
      );
      rv[1] = clamp(
        rv[1] +
          (this.cache["base color shift range green"] == null
            ? (this.cache["base color shift range green"] = Math.pow(
                this.randomizer.hd(0, 0.6, "base color shift range green"),
                2
              ))
            : this.cache["base color shift range green"]) *
            clamp(lp.r.sd(-1, 1.2), 0, 1) *
            clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1),
        0,
        1
      );
      rv[2] = clamp(
        rv[2] +
          (this.cache["base color shift range blue"] == null
            ? (this.cache["base color shift range blue"] = Math.pow(
                this.randomizer.hd(0, 0.6, "base color shift range blue"),
                2
              ))
            : this.cache["base color shift range blue"]) *
            clamp(lp.r.sd(-1, 1.2), 0, 1) *
            clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1),
        0,
        1
      );
    }
    return rv;
  }

  //Where lp is the ship to get the color for.
  getwindowcolor(lp) {
    if (this.cache["window colors"] == null) {
      this.setupColors();
    }
    var rv = this.cache["window colors"][
      lp.r.schoose(this.cache["window color chances"])
    ];
    return rv;
  }
}
