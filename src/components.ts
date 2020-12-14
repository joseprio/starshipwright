import {
  COMPONENT_GRID_SIZE,
  COMPONENT_MAXIMUM_SIZE,
  CANVAS_SHIP_EDGE,
} from "./constants";
import { clamp, colorToHex, scaleColorBy } from "./utils";
import type { Ship } from "./ship";
import type { RGBColor, Vec } from "./types";
import {computeBaseColor} from "./faction";
import type { ComponentChances, ColorData } from "./faction";

function frontness(lp: Ship, v: Vec): number {
  return 1 - v[1] / lp.h;
}

function centerness(lp: Ship, v: Vec, doX: boolean, doY: boolean): number {
  let rv = 1;
  if (doX) {
    rv = Math.min(rv, 1 - Math.abs(v[0] - lp.hw) / lp.hw);
  }
  if (doY) {
    rv = Math.min(rv, 1 - Math.abs(v[1] - lp.hh) / lp.hh);
  }
  return rv;
}

function bigness(lp: Ship, v: Vec): number {
  const effectCenter = centerness(lp, v, true, true);
  const effectShipsize = 1 - 1 / ((lp.w + lp.h) / 1000 + 1);
  const effectFaction = Math.pow(lp.f.hd(0, 1, "master bigness"), 0.5);
  const effectStack = 1 - lp.getpcdone();
  return effectCenter * effectShipsize * effectFaction * effectStack;
}

function leeway(lp: Ship, boundingBox: [Vec, Vec]): Vec {
  return [
    Math.min(
      boundingBox[0][0] - CANVAS_SHIP_EDGE,
      lp.w - CANVAS_SHIP_EDGE - boundingBox[1][0]
    ),
    Math.min(
      boundingBox[0][1] - CANVAS_SHIP_EDGE,
      lp.h - CANVAS_SHIP_EDGE - boundingBox[1][1]
    ),
  ];
}

//lp is the ship. amount is the amount of shadow at the edges, 0 - 1 (the middle is always 0). middlep and edgep should be vectors at the middle and edge of the gradient.
function shadowGradient(
  ctx: CanvasRenderingContext2D,
  middlePoint: Vec,
  edgePoint: Vec,
  amount: number
): CanvasGradient {
  const grad = ctx.createLinearGradient(
    edgePoint[0],
    edgePoint[1],
    middlePoint[0] * 2 - edgePoint[0],
    middlePoint[1] * 2 - edgePoint[1]
  );
  const darkness = `rgba(0,0,0,${clamp(amount, 0, 1)})`;
  grad.addColorStop(0, darkness);
  grad.addColorStop(0.5, "rgba(0,0,0,0)");
  grad.addColorStop(1, darkness);
  return grad;
}

type ComponentFunc = (lp: Ship, v: Vec, componentChances: ComponentChances, colorData: ColorData) => void;

// Each component function takes an argument 'lp' (for the ship) and 'v' (an integral 2-vector denoting the center of the component)
export const components: Array<ComponentFunc>  = [

// Bordered block
function (lp: Ship, v: Vec, componentChances: ComponentChances, colorData: ColorData) {
  let lcms = COMPONENT_MAXIMUM_SIZE;
  const bn = Math.pow(bigness(lp, v), 0.3);
  if (lp.r.sb(lp.f.hd(0, 0.9, "com0 bigchance") * bn)) {
    const chance = lp.f.hd(0, 0.5, "com0 bigincchance");
    while (lp.r.sb(chance * bn)) {
      const lw = leeway(lp, [
        [v[0] - lcms, v[1] - lcms],
        [v[0] + lcms, v[1] + lcms],
      ]);
      if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
        lcms *= 1.5;
      } else {
        break;
      }
    }
  }
  const lcms2 = lcms * 2;
  const dhi = [
    Math.ceil(lp.r.sd(1, Math.max(2, 0.5 * lcms))),
    Math.ceil(lp.r.sd(1, Math.max(2, 0.5 * lcms))),
  ];
  const borderwidth = Math.min(dhi[0], dhi[1]) * lp.r.sd(0.1, 1.2);
  const dho = [dhi[0] + borderwidth * 2, dhi[1] + borderwidth * 2];
  const counts = [Math.ceil(lcms2 / dho[0]), Math.ceil(lcms2 / dho[1])];
  const trv = [
    Math.round((counts[0] * dho[0]) / 2),
    Math.round((counts[1] * dho[1]) / 2),
  ];
  const pcdone = lp.getpcdone();
  const baseColor = computeBaseColor(lp.f, colorData, lp);
  const icolorh = scaleColorBy(baseColor, lp.r.sd(0.4, 1));
  const ocolorh = scaleColorBy(baseColor, lp.r.sd(0.4, 1));
  lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.25) + ")";
  lp.cfx.fillRect(
    v[0] - trv[0] - 1,
    v[1] - trv[1] - 1,
    dho[0] * counts[0] + 2,
    dho[1] * counts[1] + 2
  );
  lp.cfx.fillStyle = ocolorh;
  lp.cfx.fillRect(
    v[0] - trv[0],
    v[1] - trv[1],
    dho[0] * counts[0],
    dho[1] * counts[1]
  );
  lp.cfx.fillStyle = icolorh;
  for (let x = 0; x < counts[0]; x++) {
    const bx = v[0] + borderwidth + x * dho[0] - trv[0];
    for (let y = 0; y < counts[1]; y++) {
      const by = v[1] + borderwidth + y * dho[1] - trv[1];
      lp.cfx.fillRect(bx, by, dhi[0], dhi[1]);
    }
  }
  if (
    lp.r.sb(
      clamp((pcdone * 0.6 + 0.3) * (lcms / COMPONENT_MAXIMUM_SIZE), 0, 0.98)
    )
  ) {
    lp.cfx.fillStyle = shadowGradient(
      lp.cfx,
      v,
      [v[0] + trv[0], v[1]],
      lp.r.sd(0, 0.9)
    );
    lp.cfx.fillRect(
      v[0] - trv[0],
      v[1] - trv[1],
      dho[0] * counts[0],
      dho[1] * counts[1]
    );
  }
},
// Cylinder array
function (lp: Ship, v: Vec, baseColor: RGBColor) {
  let lcms = COMPONENT_MAXIMUM_SIZE;
  const bn = Math.pow(bigness(lp, v), 0.2);
  if (lp.r.sb(lp.f.hd(0.3, 1, "com1 bigchance") * bn)) {
    const chance = lp.f.hd(0, 0.6, "com1 bigincchance");
    while (lp.r.sb(chance * bn)) {
      const lw = leeway(lp, [
        [v[0] - lcms, v[1] - lcms],
        [v[0] + lcms, v[1] + lcms],
      ]);
      if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
        lcms *= 1.5;
      } else {
        break;
      }
    }
  }
  let w = Math.ceil(lp.r.sd(0.8, 2) * lcms);
  const h = Math.ceil(lp.r.sd(0.8, 2) * lcms);
  const cw = lp.r.si(3, Math.max(4, w));
  const count = Math.max(1, Math.round(w / cw));
  w = count * cw;
  const ccolor = scaleColorBy(baseColor, lp.r.sd(0.5, 1));
  const darkness = lp.r.sd(0.3, 0.9);
  // true = horizontal array, false = vertical array
  const orientation = lp.r.sb(
    clamp(lp.f.hd(-0.2, 1.2, "com1 hchance"), 0, 1)
  );
  if (orientation) {
    const bv = [v[0] - Math.floor(w / 2), v[1] - Math.floor(h / 2)];
    lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.25) + ")";
    lp.cfx.fillRect(bv[0] - 1, bv[1] - 1, w + 2, h + 2);
    lp.cfx.fillStyle = ccolor;
    lp.cfx.fillRect(bv[0], bv[1], w, h);
    for (let i = 0; i < count; i++) {
      lp.cfx.fillStyle = shadowGradient(
        lp.cfx,
        [bv[0] + (i + 0.5) * cw, v[1]],
        [bv[0] + i * cw, v[1]],
        darkness
      );
      lp.cfx.fillRect(bv[0] + i * cw, bv[1], cw, h);
    }
  } else {
    const bv = [v[0] - Math.floor(h / 2), v[1] - Math.floor(w / 2)];
    lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.25) + ")";
    lp.cfx.fillRect(bv[0] - 1, bv[1] - 1, h + 2, w + 2);
    lp.cfx.fillStyle = ccolor;
    lp.cfx.fillRect(bv[0], bv[1], h, w);
    for (let i = 0; i < count; i++) {
      lp.cfx.fillStyle = shadowGradient(
        lp.cfx,
        [v[0], bv[1] + (i + 0.5) * cw],
        [v[0], bv[1] + i * cw],
        darkness
      );
      lp.cfx.fillRect(bv[0], bv[1] + i * cw, w, cw);
    }
  }
},
// Banded cylinder
function (lp: Ship, v: Vec, baseColor: RGBColor) {
  let lcms = COMPONENT_MAXIMUM_SIZE;
  const bn = Math.pow(bigness(lp, v), 0.05);
  if (lp.r.sb(lp.f.hd(0, 1, "com2 bigchance") * bn)) {
    const chance = lp.f.hd(0, 0.9, "com2 bigincchance");
    while (lp.r.sb(chance * bn)) {
      const lw = leeway(lp, [
        [v[0] - lcms, v[1] - lcms],
        [v[0] + lcms, v[1] + lcms],
      ]);
      if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
        lcms *= 1.5;
      } else {
        break;
      }
    }
  }
  const w = Math.ceil(lp.r.sd(0.6, 1.4) * lcms);
  const h = Math.ceil(lp.r.sd(1, 2) * lcms);
  const wh2 = [
    Math.ceil(clamp((w * lp.r.sd(0.7, 1)) / 2, 1, w)),
    Math.ceil(clamp((w * lp.r.sd(0.8, 1)) / 2, 1, w)),
  ];
  const h2 = [
    Math.floor(clamp(w * lp.r.sd(0.05, 0.25), 1, h)),
    Math.floor(clamp(w * lp.r.sd(0.1, 0.3), 1, h)),
  ];
  const hpair = h2[0] + h2[1];
  const odd = lp.r.sb(Math.pow(lp.f.hd(0, 1, "com2 oddchance"), 0.5));
  const count = clamp(Math.floor(h / hpair), 1, h);
  const htotal = count * hpair + (odd ? h2[0] : 0);
  const scale_0 = lp.r.sd(0.6, 1);
  const scale_1 = lp.r.sd(0.6, 1);
  const color2 = [
    scaleColorBy(baseColor, scale_0),
    scaleColorBy(baseColor, scale_1),
  ];
  const lightness = 1 - lp.r.sd(0.5, 0.95);
  const colord2 = [
    scaleColorBy(baseColor, lightness * scale_0),
    scaleColorBy(baseColor, lightness * scale_1),
  ];
  const orientation = lp.r.sb(
    Math.pow(lp.f.hd(0, 1, "com2 verticalchance"), 0.1)
  );
  if (orientation) {
    const grad2_0 = lp.cfx.createLinearGradient(v[0] - wh2[0], v[1], v[0] + wh2[0], v[1]);
    const grad2_1 = lp.cfx.createLinearGradient(v[0] - wh2[1], v[1], v[0] + wh2[1], v[1]);

    grad2_0.addColorStop(0, colord2[0]);
    grad2_0.addColorStop(0.5, color2[0]);
    grad2_0.addColorStop(1, colord2[0]);
    grad2_1.addColorStop(0, colord2[1]);
    grad2_1.addColorStop(0.5, color2[1]);
    grad2_1.addColorStop(1, colord2[1]);
    const by = Math.floor(v[1] - htotal / 2);
    for (let i = 0; i < count; i++) {
      lp.cfx.fillStyle = grad2_0;
      lp.cfx.fillRect(v[0] - wh2[0], by + i * hpair, wh2[0] * 2, h2[0]);
      lp.cfx.fillStyle = grad2_1;
      lp.cfx.fillRect(v[0] - wh2[1], by + i * hpair + h2[0], wh2[1] * 2, h2[1]);
    }
    if (odd) {
      lp.cfx.fillStyle = grad2_0;
      lp.cfx.fillRect(v[0] - wh2[0], by + count * hpair, wh2[0] * 2, h2[0]);
    }
  } else {
    const grad2_0 = lp.cfx.createLinearGradient(v[0], v[1] - wh2[0], v[0], v[1] + wh2[0]);
    const grad2_1 = lp.cfx.createLinearGradient(v[0], v[1] - wh2[1], v[0], v[1] + wh2[1]);

    grad2_0.addColorStop(0, colord2[0]);
    grad2_0.addColorStop(0.5, color2[0]);
    grad2_0.addColorStop(1, colord2[0]);
    grad2_1.addColorStop(0, colord2[1]);
    grad2_1.addColorStop(0.5, color2[1]);
    grad2_1.addColorStop(1, colord2[1]);
    const bx = Math.floor(v[0] - htotal / 2);
    for (let i = 0; i < count; i++) {
      lp.cfx.fillStyle = grad2_0;
      lp.cfx.fillRect(bx + i * hpair, v[1] - wh2[0], h2[0], wh2[0] * 2);
      lp.cfx.fillStyle = grad2_1;
      lp.cfx.fillRect(bx + i * hpair + h2[0], v[1] - wh2[1], h2[1], wh2[1] * 2);
    }
    if (odd) {
      lp.cfx.fillStyle = grad2_0;
      lp.cfx.fillRect(bx + count * hpair, v[1] - wh2[0], h2[0], wh2[0] * 2);
    }
  }
},
//Rocket engine (or tries to call another random component if too far forward)
function (lp: Ship, v: Vec, componentChances: ComponentChances, colorData: ColorData) {
  if (
    lp.r.sb(frontness(lp, v) - 0.3) ||
    lp.getCellPhase(v[0], v[1] + COMPONENT_GRID_SIZE * 1.2) > 0 ||
    lp.getCellPhase(v[0], v[1] + COMPONENT_GRID_SIZE * 1.8) > 0
  ) {
    for (let tries = 0; tries < 100; tries++) {
      const which = lp.r.schoose(componentChances);
      if (which != 3) {
        components[which](lp, v, componentChances, colorData);
        return;
      }
    }
  }
  let lcms = COMPONENT_MAXIMUM_SIZE;
  const bn = Math.pow(bigness(lp, v), 0.1);
  if (lp.r.sb(lp.f.hd(0.6, 1, "com3 bigchance") * bn)) {
    const chance = lp.f.hd(0.3, 0.8, "com3 bigincchance");
    while (lp.r.sb(chance * bn)) {
      const lw = leeway(lp, [
        [v[0] - lcms, v[1] - lcms],
        [v[0] + lcms, v[1] + lcms],
      ]);
      if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
        lcms *= 1.5;
      } else {
        break;
      }
    }
  }
  const w = lp.r.sd(1, 2) * lcms;
  let h = Math.ceil(lp.r.sd(0.3, 1) * lcms);
  const nratio = lp.r.sd(0.25, 0.6);
  const nw = w * nratio;
  const midw = (w + nw) / 2;
  const midwh = midw / 2;
  const h2 = [
    Math.max(1, Math.ceil(h * lp.r.sd(0.08, 0.25))),
    Math.max(1, Math.ceil(h * lp.r.sd(0.03, 0.15))),
  ];
  const hpair = h2[0] + h2[1];
  const count = Math.ceil(h / hpair);
  h = count * hpair + h2[0];
  const [colors, colorChances] = colorData;
  const basecolor =
    colors[lp.f.hchoose(colorChances, "com3 basecolor")];
  const lightness0_mid = lp.f.hd(0.5, 0.8, "com3 lightness0 mid");
  const lightness0_edge =
    lightness0_mid - lp.f.hd(0.2, 0.4, "com3 lightness0 edge");
  const lightness1_edge = lp.f.hd(0, 0.2, "com3 lightness1 edge");
  const grad2 = [
    lp.cfx.createLinearGradient(v[0] - midwh, v[1], v[0] + midwh, v[1]),
    lp.cfx.createLinearGradient(v[0] - midwh, v[1], v[0] + midwh, v[1]),
  ];
  grad2[0].addColorStop(
    0,
    scaleColorBy(basecolor, lightness0_edge)
  );
  grad2[0].addColorStop(
    0.5,
    scaleColorBy(basecolor, lightness0_mid)
  );
  grad2[0].addColorStop(
    1,
    scaleColorBy(basecolor, lightness0_edge)
  );
  grad2[1].addColorStop(
    0,
    scaleColorBy(basecolor, lightness1_edge)
  );
  grad2[1].addColorStop(0.5, colorToHex(basecolor));
  grad2[1].addColorStop(
    1,
    scaleColorBy(basecolor, lightness1_edge)
  );
  const by = Math.ceil(v[1] - h / 2);
  lp.cfx.fillStyle = grad2[0];
  lp.cfx.beginPath();
  lp.cfx.moveTo(v[0] - nw / 2, by);
  lp.cfx.lineTo(v[0] + nw / 2, by);
  lp.cfx.lineTo(v[0] + w / 2, by + h);
  lp.cfx.lineTo(v[0] - w / 2, by + h);
  lp.cfx.fill();
  lp.cfx.fillStyle = grad2[1];
  const byh = [by + h2[0], by + hpair];
  for (let i = 0; i < count; i++) {
    const lyr = [i * hpair + h2[0], (i + 1) * hpair];
    const ly = [byh[0] + i * hpair, byh[1] + i * hpair];
    const lw = [
      (nw + (w - nw) * (lyr[0] / h)) / 2,
      (nw + (w - nw) * (lyr[1] / h)) / 2,
    ];
    lp.cfx.beginPath();
    lp.cfx.moveTo(v[0] - lw[0], ly[0]);
    lp.cfx.lineTo(v[0] + lw[0], ly[0]);
    lp.cfx.lineTo(v[0] + lw[1], ly[1]);
    lp.cfx.lineTo(v[0] - lw[1], ly[1]);
    lp.cfx.fill();
  }
},
//Elongated cylinder (calls component 0 - 2 on top of its starting point)
function (lp: Ship, v: Vec, componentChances: ComponentChances, colorData: ColorData) {
  const cn = centerness(lp, v, true, false);
  const lightmid = lp.r.sd(0.7, 1);
  const lightedge = lp.r.sd(0, 0.2);
  const baseColor = computeBaseColor(lp.f, colorData, lp);
  const colormid = scaleColorBy(baseColor, lightmid);
  const coloredge = scaleColorBy(baseColor, lightedge);
  const w = Math.max(
    3,
    Math.ceil(
      lp.size *
        Math.pow(lp.r.sd(0.4, 1), 2) *
        lp.f.hd(0.02, 0.1, "com4 maxwidth")
    )
  );
  const hwi = Math.floor(w / 2);
  const hwe = w % 2;
  const forwards = 1 * Math.pow(lp.f.hd(0, 1, "com4 directionc0"), 4);
  const backwards = 0.1 * Math.pow(lp.f.hd(0, 1, "com4 directionc1"), 4);
  const toCenter = 0.2 * Math.pow(lp.f.hd(0, 1, "com4 directionc2"), 4);
  const direction = lp.r.schoose([
    forwards * (2 - cn),
    backwards,
    toCenter * (1 + cn),
  ]);
  let ev = null;
  if (direction == 0) {
    //forwards
    const hlimit = v[1] - CANVAS_SHIP_EDGE;
    const h = Math.min(
      Math.max(
        COMPONENT_MAXIMUM_SIZE,
        hlimit - lp.r.si(0, COMPONENT_MAXIMUM_SIZE * 2)
      ),
      Math.floor(
        0.7 * lp.size * Math.pow(lp.r.sd(0, 1), lp.f.hd(2, 6, "com4 hpower0"))
      )
    );
    const bb = [
      [v[0] - hwi, v[1] - h],
      [v[0] + hwi + hwe, v[1]],
    ];
    const grad = lp.cfx.createLinearGradient(
      bb[0][0],
      bb[0][1],
      bb[1][0],
      bb[0][1]
    );
    grad.addColorStop(0, coloredge);
    grad.addColorStop(0.5, colormid);
    grad.addColorStop(1, coloredge);
    lp.cfx.fillStyle = grad;
    lp.cfx.fillRect(bb[0][0], bb[0][1], w, h);
    ev = [v[0], v[1] - h];
  } else if (direction == 1) {
    //backwards
    const hlimit = lp.h - (CANVAS_SHIP_EDGE + v[1]);
    const h = Math.min(
      Math.max(
        COMPONENT_MAXIMUM_SIZE,
        hlimit - lp.r.si(0, COMPONENT_MAXIMUM_SIZE * 2)
      ),
      Math.floor(
        0.6 * lp.size * Math.pow(lp.r.sd(0, 1), lp.f.hd(2, 7, "com4 hpower1"))
      )
    );
    const bb = [
      [v[0] - hwi, v[1]],
      [v[0] + hwi + hwe, v[1] + h],
    ];
    const grad = lp.cfx.createLinearGradient(
      bb[0][0],
      bb[0][1],
      bb[1][0],
      bb[0][1]
    );
    grad.addColorStop(0, coloredge);
    grad.addColorStop(0.5, colormid);
    grad.addColorStop(1, coloredge);
    lp.cfx.fillStyle = grad;
    lp.cfx.fillRect(bb[0][0], bb[0][1], w, h);
    ev = [v[0], v[1] + h];
  } else if (direction == 2) {
    //to center
    const grad = lp.cfx.createLinearGradient(
      v[0],
      v[1] - hwi,
      v[0],
      v[1] + hwi + hwe
    );
    grad.addColorStop(0, coloredge);
    grad.addColorStop(0.5, colormid);
    grad.addColorStop(1, coloredge);
    lp.cfx.fillStyle = grad;
    lp.cfx.fillRect(v[0], v[1] - hwi, Math.ceil(lp.hw - v[0]) + 1, w);
    ev = [lp.hw, v[1]];
  }
  const coverComC = [
    0.6 * Math.pow(lp.f.hd(0, 1, "com4 covercomc0"), 2),
    0.2 * Math.pow(lp.f.hd(0, 1, "com4 covercomc1"), 2),
    Math.pow(lp.f.hd(0, 1, "com4 covercomc2"), 2),
  ];
  components[lp.r.schoose(coverComC)](lp, v, componentChances, colorData);
  if (lp.getCellPhase(ev[0], ev[1]) > 0) {
    const nev: Vec = [
      ev[0] + Math.round(lp.r.sd(-1, 1) * COMPONENT_GRID_SIZE),
      ev[1] + Math.round(lp.r.sd(-1, 1) * COMPONENT_GRID_SIZE),
    ];
    if (lp.getCellPhase(nev[0], nev[1]) > 0) {
      components[lp.r.schoose(coverComC)](lp, nev, componentChances, colorData);
    } else {
      components[lp.r.schoose(coverComC)](lp, ev, componentChances, colorData);
    }
  }
},
//Ball
function(lp: Ship, v: Vec, componentChances: ComponentChances, colorData: ColorData) {
  let lcms = COMPONENT_MAXIMUM_SIZE;
  const bn = Math.pow(bigness(lp, v), 0.1);
  if (lp.r.sb(lp.f.hd(0, 0.9, "com5 bigchance") * bn)) {
    const chance = lp.f.hd(0, 0.8, "com5 bigincchance");
    while (lp.r.sb(chance * bn)) {
      const lw = leeway(lp, [
        [v[0] - lcms, v[1] - lcms],
        [v[0] + lcms, v[1] + lcms],
      ]);
      if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
        lcms *= 1.5;
      } else {
        break;
      }
    }
  }
  const lightmid = lp.r.sd(0.75, 1);
  const lightedge = lp.r.sd(0, 0.25);
  const baseColor = computeBaseColor(lp.f, colorData, lp);
  const colormid = scaleColorBy(baseColor, lightmid);
  const coloredge = scaleColorBy(baseColor, lightedge);
  const countx =
    1 +
    lp.r.sseq(
      lp.f.hd(0, 1, "com5 multxc"),
      Math.floor(1.2 * Math.pow(lcms / COMPONENT_MAXIMUM_SIZE, 0.6))
    );
  const county =
    1 +
    lp.r.sseq(
      lp.f.hd(0, 1, "com5 multyc"),
      Math.floor(1.2 * Math.pow(lcms / COMPONENT_MAXIMUM_SIZE, 0.6))
    );
  const smallr = (lp.r.sd(0.5, 1) * lcms) / Math.max(countx, county);
  const drawr = smallr + 0.5;
  const shadowr = smallr + 1;
  const centerr = smallr * 0.2;
  const hw = smallr * countx;
  const hh = smallr * county;
  const bv = [v[0] - hw, v[1] - hh];
  lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.2) + ")";
  for (let ax = 0; ax < countx; ax++) {
    const px = bv[0] + (ax * 2 + 1) * smallr;
    for (let ay = 0; ay < county; ay++) {
      const py = bv[1] + (ay * 2 + 1) * smallr;
      lp.cfx.beginPath();
      lp.cfx.arc(px, py, shadowr, 0, 2 * Math.PI);
      lp.cfx.fill();
    }
  }
  for (let ax = 0; ax < countx; ax++) {
    const px = bv[0] + (ax * 2 + 1) * smallr;
    for (let ay = 0; ay < county; ay++) {
      const py = bv[1] + (ay * 2 + 1) * smallr;
      const grad = lp.cfx.createRadialGradient(px, py, centerr, px, py, drawr);
      grad.addColorStop(0, colormid);
      grad.addColorStop(1, coloredge);
      lp.cfx.fillStyle = grad;
      lp.cfx.beginPath();
      lp.cfx.arc(px, py, drawr, 0, 2 * Math.PI);
      lp.cfx.fill();
    }
  }
},
//Forward-facing trapezoidal fin
function (lp: Ship, v: Vec, componentChances: ComponentChances, colorData: ColorData) {
  if (lp.nextpass <= 0 || lp.r.sb(frontness(lp, v))) {
    components[lp.r.schoose(componentChances.slice(0, 6))](lp, v, componentChances, colorData);
    return;
  }
  let lcms = COMPONENT_MAXIMUM_SIZE;
  const bn = Math.pow(bigness(lp, v), 0.05);
  if (lp.r.sb(lp.f.hd(0, 0.9, "com6 bigchance") * bn)) {
    const chance = lp.f.hd(0, 0.8, "com6 bigincchance");
    while (lp.r.sb(chance * bn)) {
      const lw = leeway(lp, [
        [v[0] - lcms, v[1] - lcms],
        [v[0] + lcms, v[1] + lcms],
      ]);
      if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
        lcms *= 1.5;
      } else {
        break;
      }
    }
  }
  const h0 = Math.ceil(lcms * 2 * lp.r.sd(0.6, 1)); //Inner height, longer.
  const hh0i = Math.floor(h0 / 2);
  const hh0e = h0 % 2;
  //Outer height, shorter
  const h1 =
    h0 *
    Math.pow(
      lp.r.sd(Math.pow(lp.f.hd(0, 0.8, "com6 h1min"), 0.5), 0.9),
      lp.f.hd(0.5, 1.5, "com6 h1power")
    );
  const hh1i = Math.floor(h1 / 2);
  const hh1e = h0 % 2;
  const backamount = Math.max(
    0 - (h0 - h1) / 2,
    h0 *
      (lp.r.sd(0, 0.45) + lp.r.sd(0, 0.45)) *
      (lp.f.hb(0.8, "com6 backnesstype")
            ? lp.f.hd(0.2, 0.9, "com6 backness#pos")
            : lp.f.hd(-0.2, -0.05, "com6 backness#neg"))
  );
  const w = Math.ceil(
    lcms * lp.r.sd(0.7, 1) * Math.pow(lp.f.hd(0.1, 3.5, "com6 width"), 0.5)
  );
  const hwi = Math.floor(w / 2);
  const hwe = w % 2;
  const quad = [
    [v[0] - hwi, v[1] + backamount - hh1i],
    [v[0] + hwi + hwe, v[1] - hh0i],
    [v[0] + hwi + hwe, v[1] + hh0i + hh0e],
    [v[0] - hwi, v[1] + backamount + hh1i + hh1e],
  ];
  const baseColor = computeBaseColor(lp.f, colorData, lp);
  lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.2) + ")";
  lp.cfx.beginPath();
  lp.cfx.moveTo(quad[0][0] - 1, quad[0][1]);
  lp.cfx.lineTo(quad[1][0] - 1, quad[1][1]);
  lp.cfx.lineTo(quad[2][0] - 1, quad[2][1]);
  lp.cfx.lineTo(quad[3][0] - 1, quad[3][1]);
  lp.cfx.fill();
  lp.cfx.fillStyle = scaleColorBy(baseColor, lp.r.sd(0.7, 1));
  lp.cfx.beginPath();
  lp.cfx.moveTo(quad[0][0], quad[0][1]);
  lp.cfx.lineTo(quad[1][0], quad[1][1]);
  lp.cfx.lineTo(quad[2][0], quad[2][1]);
  lp.cfx.lineTo(quad[3][0], quad[3][1]);
  lp.cfx.fill();
}];

/*
components["cabin !UNUSED"] = function (
  lp,
  v //Cabin
) {
  if (lp.nextpass <= 0 || lp.r.sb(backness(lp, v))) {
    components[lp.r.schoose(lp.f.componentChances.slice(0, 6))](lp, v);
    return;
  }
  var lcms = cms;
  var bn = Math.pow(bigness(lp, v), 0.1);
  if (
    lp.r.sb(
      (lp.f.cache["com7 bigchance"] == null
        ? (lp.f.cache["com7 bigchance"] = lp.f.r.hd(0, 0.9, "com7 bigchance"))
        : lp.f.cache["com7 bigchance"]) * bn
    )
  ) {
    while (
      lp.r.sb(
        (lp.f.cache["com7 bigincchance"] == null
          ? (lp.f.cache["com7 bigincchance"] = lp.f.r.hd(
              0,
              0.9,
              "com7 bigincchance"
            ))
          : lp.f.cache["com7 bigincchance"]) * bn
      )
    ) {
      var lw = leeway(lp, [
        [v[0] - lcms, v[1] - lcms],
        [v[0] + lcms, v[1] + lcms],
      ]);
      if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
        lcms *= 1.5;
      } else {
        break;
      }
    }
  }
  var h =
    lcms *
    lp.r.sd(1, 2) *
    (lp.f.cache["com7 height"] == null
      ? (lp.f.cache["com7 height"] = lp.f.r.hd(0.5, 1, "com7 height"))
      : lp.f.cache["com7 height"]);
  var hh = h / 2;
  var w =
    1 +
    h *
      (lp.f.cache["com7 width"] == null
        ? (lp.f.cache["com7 width"] = lp.f.r.hd(0.3, 0.8, "com7 width"))
        : lp.f.cache["com7 width"]);
  var hw = w / 2;
  var windowcolor = lp.f.getwindowcolor(lp);
  var lightness0 = lp.r.sd(0.7, 0.9);
  var lightness1 = lp.r.sd(0.4, 0.6);
  var color0 = scaleColorBy(windowcolor, lightness0);
  var color1 = scaleColorBy(windowcolor, lightness1);
  var transparency =
    lp.f.cache["com7 transparency"] == null
      ? (lp.f.cache["com7 transparency"] = lp.f.r.hd(0.3, 0.5, "com7 transparency"))
      : lp.f.cache["com7 transparency"];
  var grad = lp.cfx.createRadialGradient(0, 0, w / 20, 0, 0, w / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(
    0.3,
    "rgba(" +
      clamp(Math.round(color0[0] * 255), 0, 255) +
      ("," + clamp(Math.round(color0[1] * 255), 0, 255)) +
      ("," +
        clamp(Math.round(color0[2] * 255), 0, 255) +
        ("," + (1 - transparency) + ")"))
  );
  grad.addColorStop(
    1,
    "rgba(" +
      clamp(Math.round(color1[0] * 255), 0, 255) +
      ("," + clamp(Math.round(color1[1] * 255), 0, 255)) +
      ("," +
        clamp(Math.round(color1[2] * 255), 0, 255) +
        ("," + (1 - transparency / 2) + ")"))
  );
  lp.cfx.setTransform(1, 0, 0, h / w, v[0], v[1]);
  lp.cfx.fillStyle = grad;
  lp.cfx.beginPath();
  lp.cfx.arc(0, 0, w / 2, 0, pi2);
  lp.cfx.fill();
  lp.cfx.setTransform(1, 0, 0, 1, 0, 0);
};
*/

//END COMPONENTS
