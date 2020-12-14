import { clamp, hsvToRgb } from "./utils";
export function computeFactionComponentChances(factionRandomizer) {
    const componentChances = [];
    const dp = 8; // Default maximum power
    componentChances[0] =
        0.8 * factionRandomizer.sd(0.001, 1) * Math.pow(2, factionRandomizer.sd(0, dp));
    componentChances[1] =
        0.9 * factionRandomizer.sd(0.01, 1) * Math.pow(2, factionRandomizer.sd(0, dp));
    componentChances[2] =
        1 * factionRandomizer.sd(0.001, 1) * Math.pow(2, factionRandomizer.sd(0, dp));
    componentChances[3] =
        3 * factionRandomizer.sd(0, 1) * Math.pow(2, factionRandomizer.sd(0, dp));
    componentChances[4] =
        0.5 * factionRandomizer.sd(0, 1) * Math.pow(2, factionRandomizer.sd(0, dp));
    componentChances[5] =
        0.05 * factionRandomizer.sd(0, 1) * Math.pow(2, factionRandomizer.sd(0, dp));
    componentChances[6] =
        0.5 * factionRandomizer.sd(0, 1) * Math.pow(2, factionRandomizer.sd(0, dp));
    return componentChances;
}
export function computeFactionColors(factionRandomizer) {
    const colors = [];
    const colorChances = [];
    const dp = 6; // Default maximum power
    const baseColorCount = 1 +
        (factionRandomizer.hb(0.7, "base color +1") ? 1 : 0) +
        factionRandomizer.hseq(0.3, 3, "base color count");
    for (let i = 0; i < baseColorCount; i++) {
        const ls = "base color" + i;
        colors.push(hsvToRgb([
            Math.pow(factionRandomizer.hd(0, 1, ls + "hue"), 2),
            clamp(factionRandomizer.hd(-0.2, 1, ls + "saturation"), 0, Math.pow(factionRandomizer.hd(0, 1, ls + "saturation bound"), 4)),
            clamp(factionRandomizer.hd(0.7, 1.1, ls + "value"), 0, 1),
        ]));
        colorChances.push(Math.pow(2, factionRandomizer.hd(0, dp, ls + "chances")));
    }
    return [colors, colorChances];
}
export function computeBaseColor(factionRandomizer, factionColorData, lp) {
    const [colors, colorChances] = factionColorData;
    let rv = colors[lp.r.schoose(colorChances)];
    if (lp.r.sb(Math.pow(factionRandomizer.hd(0, 0.5, "base color shift chance"), 2))) {
        rv = [rv[0], rv[1], rv[2]];
        rv[0] = clamp(rv[0] +
            Math.pow(factionRandomizer.hd(0, 0.6, "base color shift range red"), 2) *
                clamp(lp.r.sd(-1, 1.2), 0, 1) *
                clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1), 0, 1);
        rv[1] = clamp(rv[1] +
            Math.pow(factionRandomizer.hd(0, 0.6, "base color shift range green"), 2) *
                clamp(lp.r.sd(-1, 1.2), 0, 1) *
                clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1), 0, 1);
        rv[2] = clamp(rv[2] +
            Math.pow(factionRandomizer.hd(0, 0.6, "base color shift range blue"), 2) *
                clamp(lp.r.sd(-1, 1.2), 0, 1) *
                clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1), 0, 1);
    }
    return rv;
}
//Where lp is the ship to get the color for
/*
getwindowcolor(lp) {
  if (this.cache["window colors"] == null) {
    var dp = 5; //Default maximum power.
    this.cache["window color count"] =
      1 + (this.r.hb(0.3, "window color +1") ? 1 : 0);
    this.cache["window colors"] = new Array(this.cache["window color count"]);
    this.cache["window color chances"] = new Array(
      this.cache["window color count"]
    );
    for (var i = 0; i < this.cache["window color count"]; i++) {
      var ls = "window color" + i;
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
  var rv = this.cache["window colors"][
    lp.r.schoose(this.cache["window color chances"])
  ];
  return rv;
}
*/
