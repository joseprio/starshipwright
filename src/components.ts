import {
  COMPONENT_GRID_SIZE,
  COMPONENT_MAXIMUM_SIZE,
  CANVAS_SHIP_EDGE,
} from "./constants";
import { clamp, colorToHex, copyArray, scaleColorBy } from "./utils";

function backness(lp, v) {
  return v[1] / lp.h;
}

function frontness(lp, v) {
  return 1 - v[1] / lp.h;
}

function centerness(lp, v, do_x, do_y) {
  var rv = 1;
  if (do_x) {
    rv = Math.min(rv, 1 - Math.abs(v[0] - lp.hw) / lp.hw);
  }
  if (do_y) {
    rv = Math.min(rv, 1 - Math.abs(v[1] - lp.hh) / lp.hh);
  }
  return rv;
}

function bigness(lp, v) {
  var effect_center = centerness(lp, v, true, true);
  var effect_shipsize = 1 - 1 / ((lp.w + lp.h) / 1000 + 1);
  var effect_faction = Math.pow(
    lp.f.randomizer.hd(0, 1, "master bigness"),
    0.5
  );
  var effect_stack = 1 - lp.getpcdone();
  return effect_center * effect_shipsize * effect_faction * effect_stack;
}

function leeway(lp, bb) {
  return [
    Math.min(bb[0][0] - CANVAS_SHIP_EDGE, lp.w - CANVAS_SHIP_EDGE - bb[1][0]),
    Math.min(bb[0][1] - CANVAS_SHIP_EDGE, lp.h - CANVAS_SHIP_EDGE - bb[1][1]),
  ];
}

function shadowcolor(amount: number): string {
  //amount is the amount of shadow, 0 - 1.
  return "rgba(0,0,0," + clamp(amount, 0, 1) + ")";
}

function shadowgradient(lp, middlep, edgep, amount) {
  //lp is the ship. amount is the amount of shadow at the edges, 0 - 1 (the middle is always 0). middlep and edgep should be vectors at the middle and edge of the gradient.
  var grad = lp.cfx.createLinearGradient(
    edgep[0],
    edgep[1],
    middlep[0] * 2 - edgep[0],
    middlep[1] * 2 - edgep[1]
  );
  var darkness = shadowcolor(amount);
  grad.addColorStop(0, darkness);
  grad.addColorStop(0.5, "rgba(0,0,0,0)");
  grad.addColorStop(1, darkness);
  return grad;
}

export const components = []; //Each component function takes an argument 'lp' (for the ship) and 'v' (an integral 2-vector denoting the center of the component).

components[0] = function (
  lp,
  v //Bordered block.
) {
  let lcms = COMPONENT_MAXIMUM_SIZE;
  var bn = Math.pow(bigness(lp, v), 0.3);
  if (lp.r.sb(lp.f.randomizer.hd(0, 0.9, "com0 bigchance")) * bn) {
    while (
      lp.r.sb(
        (lp.f.cache["com0 bigincchance"] == null
          ? (lp.f.cache["com0 bigincchance"] = lp.f.randomizer.hd(
              0,
              0.5,
              "com0 bigincchance"
            ))
          : lp.f.cache["com0 bigincchance"]) * bn
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
  var lcms2 = lcms * 2;
  var dhi = [
    Math.ceil(lp.r.sd(1, Math.max(2, 0.5 * lcms))),
    Math.ceil(lp.r.sd(1, Math.max(2, 0.5 * lcms))),
  ];
  var borderwidth = Math.min(dhi[0], dhi[1]) * lp.r.sd(0.1, 1.2);
  var dho = [dhi[0] + borderwidth * 2, dhi[1] + borderwidth * 2];
  var counts = [Math.ceil(lcms2 / dho[0]), Math.ceil(lcms2 / dho[1])];
  var trv = [
    Math.round((counts[0] * dho[0]) / 2),
    Math.round((counts[1] * dho[1]) / 2),
  ];
  var pcdone = lp.getpcdone();
  var basecolor = lp.f.getBaseColor(lp);
  var icolorh = colorToHex(scaleColorBy(basecolor, lp.r.sd(0.4, 1)));
  var ocolorh = colorToHex(scaleColorBy(basecolor, lp.r.sd(0.4, 1)));
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
  for (var x = 0; x < counts[0]; x++) {
    var bx = v[0] + borderwidth + x * dho[0] - trv[0];
    for (var y = 0; y < counts[1]; y++) {
      var by = v[1] + borderwidth + y * dho[1] - trv[1];
      lp.cfx.fillRect(bx, by, dhi[0], dhi[1]);
    }
  }
  if (
    lp.r.sb(
      clamp((pcdone * 0.6 + 0.3) * (lcms / COMPONENT_MAXIMUM_SIZE), 0, 0.98)
    )
  ) {
    lp.cfx.fillStyle = shadowgradient(
      lp,
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
};

components[1] = function (
  lp,
  v //Cylinder array
) {
  var lcms = COMPONENT_MAXIMUM_SIZE;
  var bn = Math.pow(bigness(lp, v), 0.2);
  if (
    lp.r.sb(
      (lp.f.cache["com1 bigchance"] == null
        ? (lp.f.cache["com1 bigchance"] = lp.f.randomizer.hd(
            0.3,
            1,
            "com1 bigchance"
          ))
        : lp.f.cache["com1 bigchance"]) * bn
    )
  ) {
    while (
      lp.r.sb(
        (lp.f.cache["com1 bigincchance"] == null
          ? (lp.f.cache["com1 bigincchance"] = lp.f.randomizer.hd(
              0,
              0.6,
              "com1 bigincchance"
            ))
          : lp.f.cache["com1 bigincchance"]) * bn
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
  var w = Math.ceil(lp.r.sd(0.8, 2) * lcms);
  var h = Math.ceil(lp.r.sd(0.8, 2) * lcms);
  var cw = lp.r.si(3, Math.max(4, w));
  var count = Math.max(1, Math.round(w / cw));
  w = count * cw;
  var basecolor = lp.f.getBaseColor(lp);
  var ccolor = colorToHex(scaleColorBy(basecolor, lp.r.sd(0.5, 1)));
  var darkness = lp.r.sd(0.3, 0.9);
  var orientation = lp.r.sb(
    lp.f.cache["com1 hchance"] == null
      ? (lp.f.cache["com1 hchance"] = clamp(
          lp.f.randomizer.hd(-0.2, 1.2, "com1 hchance"),
          0,
          1
        ))
      : lp.f.cache["com1 hchance"]
  ); //true = horizontal array, false = vertical array.
  if (orientation) {
    var bv = [v[0] - Math.floor(w / 2), v[1] - Math.floor(h / 2)];
    lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.25) + ")";
    lp.cfx.fillRect(bv[0] - 1, bv[1] - 1, w + 2, h + 2);
    lp.cfx.fillStyle = ccolor;
    lp.cfx.fillRect(bv[0], bv[1], w, h);
    for (var i = 0; i < count; i++) {
      lp.cfx.fillStyle = shadowgradient(
        lp,
        [bv[0] + (i + 0.5) * cw, v[1]],
        [bv[0] + i * cw, v[1]],
        darkness
      );
      lp.cfx.fillRect(bv[0] + i * cw, bv[1], cw, h);
    }
  } else {
    var bv = [v[0] - Math.floor(h / 2), v[1] - Math.floor(w / 2)];
    lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.25) + ")";
    lp.cfx.fillRect(bv[0] - 1, bv[1] - 1, h + 2, w + 2);
    lp.cfx.fillStyle = ccolor;
    lp.cfx.fillRect(bv[0], bv[1], h, w);
    for (var i = 0; i < count; i++) {
      lp.cfx.fillStyle = shadowgradient(
        lp,
        [v[0], bv[1] + (i + 0.5) * cw],
        [v[0], bv[1] + i * cw],
        darkness
      );
      lp.cfx.fillRect(bv[0], bv[1] + i * cw, w, cw);
    }
  }
};

components[2] = function (
  lp,
  v //Banded cylinder
) {
  let lcms = COMPONENT_MAXIMUM_SIZE;
  var bn = Math.pow(bigness(lp, v), 0.05);
  if (
    lp.r.sb(
      (lp.f.cache["com2 bigchance"] == null
        ? (lp.f.cache["com2 bigchance"] = lp.f.randomizer.hd(
            0,
            1,
            "com2 bigchance"
          ))
        : lp.f.cache["com2 bigchance"]) * bn
    )
  ) {
    while (
      lp.r.sb(
        (lp.f.cache["com2 bigincchance"] == null
          ? (lp.f.cache["com2 bigincchance"] = lp.f.randomizer.hd(
              0,
              0.9,
              "com2 bigincchance"
            ))
          : lp.f.cache["com2 bigincchance"]) * bn
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
  var w = Math.ceil(lp.r.sd(0.6, 1.4) * lcms);
  var h = Math.ceil(lp.r.sd(1, 2) * lcms);
  var wh2 = [
    Math.ceil(clamp((w * lp.r.sd(0.7, 1)) / 2, 1, w)),
    Math.ceil(clamp((w * lp.r.sd(0.8, 1)) / 2, 1, w)),
  ];
  var h2 = [
    Math.floor(clamp(w * lp.r.sd(0.05, 0.25), 1, h)),
    Math.floor(clamp(w * lp.r.sd(0.1, 0.3), 1, h)),
  ];
  var hpair = h2[0] + h2[1];
  var odd = lp.r.sb(
    lp.f.cache["com2 oddchance"] == null
      ? (lp.f.cache["com2 oddchance"] = Math.pow(
          lp.f.randomizer.hd(0, 1, "com2 oddchance"),
          0.5
        ))
      : lp.f.cache["com2 oddchance"]
  );
  var count = clamp(Math.floor(h / hpair), 1, h);
  var htotal = count * hpair + (odd ? h2[0] : 0);
  var basecolor = lp.f.getBaseColor(lp);
  var color2 = [
    scaleColorBy(basecolor, lp.r.sd(0.6, 1)),
    scaleColorBy(basecolor, lp.r.sd(0.6, 1)),
  ];
  var darkness = lp.r.sd(0.5, 0.95);
  var lightness = 1 - darkness;
  var colord2 = [
    scaleColorBy(color2[0], lightness),
    scaleColorBy(color2[1], lightness),
  ];
  var orientation = lp.r.sb(
    lp.f.cache["com2 verticalchance"] == null
      ? (lp.f.cache["com2 verticalchance"] = Math.pow(
          lp.f.randomizer.hd(0, 1, "com2 verticalchance"),
          0.1
        ))
      : lp.f.cache["com2 verticalchance"]
  );
  if (orientation) {
    var grad2 = [
      lp.cfx.createLinearGradient(v[0] - wh2[0], v[1], v[0] + wh2[0], v[1]),
      lp.cfx.createLinearGradient(v[0] - wh2[1], v[1], v[0] + wh2[1], v[1]),
    ];
    grad2[0].addColorStop(0, colorToHex(colord2[0]));
    grad2[0].addColorStop(0.5, colorToHex(color2[0]));
    grad2[0].addColorStop(1, colorToHex(colord2[0]));
    grad2[1].addColorStop(0, colorToHex(colord2[1]));
    grad2[1].addColorStop(0.5, colorToHex(color2[1]));
    grad2[1].addColorStop(1, colorToHex(colord2[1]));
    var by = Math.floor(v[1] - htotal / 2);
    for (var i = 0; i < count; i++) {
      lp.cfx.fillStyle = grad2[0];
      lp.cfx.fillRect(v[0] - wh2[0], by + i * hpair, wh2[0] * 2, h2[0]);
      lp.cfx.fillStyle = grad2[1];
      lp.cfx.fillRect(v[0] - wh2[1], by + i * hpair + h2[0], wh2[1] * 2, h2[1]);
    }
    if (odd) {
      lp.cfx.fillStyle = grad2[0];
      lp.cfx.fillRect(v[0] - wh2[0], by + count * hpair, wh2[0] * 2, h2[0]);
    }
  } else {
    var grad2 = [
      lp.cfx.createLinearGradient(v[0], v[1] - wh2[0], v[0], v[1] + wh2[0]),
      lp.cfx.createLinearGradient(v[0], v[1] - wh2[1], v[0], v[1] + wh2[1]),
    ];
    grad2[0].addColorStop(0, colorToHex(colord2[0]));
    grad2[0].addColorStop(0.5, colorToHex(color2[0]));
    grad2[0].addColorStop(1, colorToHex(colord2[0]));
    grad2[1].addColorStop(0, colorToHex(colord2[1]));
    grad2[1].addColorStop(0.5, colorToHex(color2[1]));
    grad2[1].addColorStop(1, colorToHex(colord2[1]));
    var bx = Math.floor(v[0] - htotal / 2);
    for (var i = 0; i < count; i++) {
      lp.cfx.fillStyle = grad2[0];
      lp.cfx.fillRect(bx + i * hpair, v[1] - wh2[0], h2[0], wh2[0] * 2);
      lp.cfx.fillStyle = grad2[1];
      lp.cfx.fillRect(bx + i * hpair + h2[0], v[1] - wh2[1], h2[1], wh2[1] * 2);
    }
    if (odd) {
      lp.cfx.fillStyle = grad2[0];
      lp.cfx.fillRect(bx + count * hpair, v[1] - wh2[0], h2[0], wh2[0] * 2);
    }
  }
};

components[3] = function (
  lp,
  v //Rocket engine (or tries to call another random component if too far forward)
) {
  if (
    lp.r.sb(frontness(lp, v) - 0.3) ||
    lp.getcellstate(v[0], v[1] + COMPONENT_GRID_SIZE * 1.2) > 0 ||
    lp.getcellstate(v[0], v[1] + COMPONENT_GRID_SIZE * 1.8) > 0
  ) {
    for (var tries = 0; tries < 100; tries++) {
      var which = lp.r.schoose(lp.f.componentChances);
      if (which != 3) {
        components[which](lp, v);
        return;
      }
    }
  }
  let lcms = COMPONENT_MAXIMUM_SIZE;
  var bn = Math.pow(bigness(lp, v), 0.1);
  if (
    lp.r.sb(
      (lp.f.cache["com3 bigchance"] == null
        ? (lp.f.cache["com3 bigchance"] = lp.f.randomizer.hd(
            0.6,
            1,
            "com3 bigchance"
          ))
        : lp.f.cache["com3 bigchance"]) * bn
    )
  ) {
    while (
      lp.r.sb(
        (lp.f.cache["com3 bigincchance"] == null
          ? (lp.f.cache["com3 bigincchance"] = lp.f.randomizer.hd(
              0.3,
              0.8,
              "com3 bigincchance"
            ))
          : lp.f.cache["com3 bigincchance"]) * bn
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
  var w = lp.r.sd(1, 2) * lcms;
  var h = Math.ceil(lp.r.sd(0.3, 1) * lcms);
  var nratio = lp.r.sd(0.25, 0.6);
  var nw = w * nratio;
  var midw = (w + nw) / 2;
  var midwh = midw / 2;
  var h2 = [
    Math.max(1, Math.ceil(h * lp.r.sd(0.08, 0.25))),
    Math.max(1, Math.ceil(h * lp.r.sd(0.03, 0.15))),
  ];
  var hpair = h2[0] + h2[1];
  var count = Math.ceil(h / hpair);
  h = count * hpair + h2[0];
  lp.f.setupColors();
  var basecolor =
    lp.f.cache["base colors"][
      lp.f.cache["com3 basecolor"] == null
        ? (lp.f.cache["com3 basecolor"] = lp.f.randomizer.hchoose(
            lp.f.cache["base color chances"],
            "com3 basecolor"
          ))
        : lp.f.cache["com3 basecolor"]
    ];
  var lightness0_mid =
    lp.f.cache["com3 lightness0 mid"] == null
      ? (lp.f.cache["com3 lightness0 mid"] = lp.f.randomizer.hd(
          0.5,
          0.8,
          "com3 lightness0 mid"
        ))
      : lp.f.cache["com3 lightness0 mid"];
  var lightness0_edge =
    lightness0_mid -
    (lp.f.cache["com3 lightness0 edge"] == null
      ? (lp.f.cache["com3 lightness0 edge"] = lp.f.randomizer.hd(
          0.2,
          0.4,
          "com3 lightness0 edge"
        ))
      : lp.f.cache["com3 lightness0 edge"]);
  var lightness1_edge =
    lp.f.cache["com3 lightness1 edge"] == null
      ? (lp.f.cache["com3 lightness1 edge"] = lp.f.randomizer.hd(
          0,
          0.2,
          "com3 lightness1 edge"
        ))
      : lp.f.cache["com3 lightness1 edge"];
  var grad2 = [
    lp.cfx.createLinearGradient(v[0] - midwh, v[1], v[0] + midwh, v[1]),
    lp.cfx.createLinearGradient(v[0] - midwh, v[1], v[0] + midwh, v[1]),
  ];
  grad2[0].addColorStop(
    0,
    colorToHex(scaleColorBy(basecolor, lightness0_edge))
  );
  grad2[0].addColorStop(
    0.5,
    colorToHex(scaleColorBy(basecolor, lightness0_mid))
  );
  grad2[0].addColorStop(
    1,
    colorToHex(scaleColorBy(basecolor, lightness0_edge))
  );
  grad2[1].addColorStop(
    0,
    colorToHex(scaleColorBy(basecolor, lightness1_edge))
  );
  grad2[1].addColorStop(0.5, colorToHex(basecolor));
  grad2[1].addColorStop(
    1,
    colorToHex(scaleColorBy(basecolor, lightness1_edge))
  );
  var by = Math.ceil(v[1] - h / 2);
  lp.cfx.fillStyle = grad2[0];
  lp.cfx.beginPath();
  lp.cfx.moveTo(v[0] - nw / 2, by);
  lp.cfx.lineTo(v[0] + nw / 2, by);
  lp.cfx.lineTo(v[0] + w / 2, by + h);
  lp.cfx.lineTo(v[0] - w / 2, by + h);
  lp.cfx.fill();
  lp.cfx.fillStyle = grad2[1];
  var byh = [by + h2[0], by + hpair];
  for (var i = 0; i < count; i++) {
    var lyr = [i * hpair + h2[0], (i + 1) * hpair];
    var ly = [byh[0] + i * hpair, byh[1] + i * hpair];
    var lw = [
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
};

components[4] = function (
  lp,
  v //Elongated cylinder (calls component 0 - 2 on top of its starting point)
) {
  var cn = centerness(lp, v, true, false);
  var lightmid = lp.r.sd(0.7, 1);
  var lightedge = lp.r.sd(0, 0.2);
  var basecolor = lp.f.getBaseColor(lp);
  var colormid = colorToHex(scaleColorBy(basecolor, lightmid));
  var coloredge = colorToHex(scaleColorBy(basecolor, lightedge));
  if (lp.f.cache["com4 directionc"] == null) {
    lp.f.cache["com4 directionc"] = [
      1 * Math.pow(lp.f.randomizer.hd(0, 1, "com4 directionc0"), 4), //forwards
      0.1 * Math.pow(lp.f.randomizer.hd(0, 1, "com4 directionc1"), 4), //backwards
      0.2 * Math.pow(lp.f.randomizer.hd(0, 1, "com4 directionc2"), 4), //to center
    ];
  }
  var w = Math.max(
    3,
    Math.ceil(
      lp.size *
        Math.pow(lp.r.sd(0.4, 1), 2) *
        (lp.f.cache["com4 maxwidth"] == null
          ? (lp.f.cache["com4 maxwidth"] = lp.f.randomizer.hd(
              0.02,
              0.1,
              "com4 maxwidth"
            ))
          : lp.f.cache["com4 maxwidth"])
    )
  );
  var hwi = Math.floor(w / 2);
  var hwe = w % 2;
  var direction = lp.r.schoose([
    lp.f.cache["com4 directionc"][0] * (2 - cn),
    lp.f.cache["com4 directionc"][1],
    lp.f.cache["com4 directionc"][2] * (1 + cn),
  ]);
  var ev = null;
  if (direction == 0) {
    //forwards
    var hlimit = v[1] - CANVAS_SHIP_EDGE;
    var h = Math.min(
      Math.max(
        COMPONENT_MAXIMUM_SIZE,
        hlimit - lp.r.si(0, COMPONENT_MAXIMUM_SIZE * 2)
      ),
      Math.floor(
        0.7 *
          lp.size *
          Math.pow(
            lp.r.sd(0, 1),
            lp.f.cache["com4 hpower0"] == null
              ? (lp.f.cache["com4 hpower0"] = lp.f.randomizer.hd(
                  2,
                  6,
                  "com4 hpower0"
                ))
              : lp.f.cache["com4 hpower0"]
          )
      )
    );
    var bb = [
      [v[0] - hwi, v[1] - h],
      [v[0] + hwi + hwe, v[1]],
    ];
    var grad = lp.cfx.createLinearGradient(
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
    var hlimit = lp.h - (CANVAS_SHIP_EDGE + v[1]);
    var h = Math.min(
      Math.max(
        COMPONENT_MAXIMUM_SIZE,
        hlimit - lp.r.si(0, COMPONENT_MAXIMUM_SIZE * 2)
      ),
      Math.floor(
        0.6 *
          lp.size *
          Math.pow(
            lp.r.sd(0, 1),
            lp.f.cache["com4 hpower1"] == null
              ? (lp.f.cache["com4 hpower1"] = lp.f.randomizer.hd(
                  2,
                  7,
                  "com4 hpower1"
                ))
              : lp.f.cache["com4 hpower1"]
          )
      )
    );
    var bb = [
      [v[0] - hwi, v[1]],
      [v[0] + hwi + hwe, v[1] + h],
    ];
    var grad = lp.cfx.createLinearGradient(
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
    var grad = lp.cfx.createLinearGradient(
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
    ev = [Math.floor(lp.hw), v[1] + h];
  }
  if (lp.f.cache["com4 covercomc"] == null) {
    lp.f.cache["com4 covercomc"] = [
      0.6 * Math.pow(lp.f.randomizer.hd(0, 1, "com4 covercomc0"), 2),
      0.2 * Math.pow(lp.f.randomizer.hd(0, 1, "com4 covercomc1"), 2),
      1 * Math.pow(lp.f.randomizer.hd(0, 1, "com4 covercomc2"), 2),
    ];
  }
  components[lp.r.schoose(lp.f.cache["com4 covercomc"])](lp, v);
  if (lp.getcellstate(ev[0], ev[1]) > 0) {
    var nev = [
      ev[0] + Math.round(lp.r.sd(-1, 1) * COMPONENT_GRID_SIZE),
      ev[1] + Math.round(lp.r.sd(-1, 1) * COMPONENT_GRID_SIZE),
    ];
    if (lp.getcellstate(nev[0], nev[1]) > 0) {
      components[lp.r.schoose(lp.f.cache["com4 covercomc"])](lp, nev);
    } else {
      components[lp.r.schoose(lp.f.cache["com4 covercomc"])](lp, ev);
    }
  }
};

components[5] = function (
  lp,
  v //Ball
) {
  let lcms = COMPONENT_MAXIMUM_SIZE;
  var bn = Math.pow(bigness(lp, v), 0.1);
  if (
    lp.r.sb(
      (lp.f.cache["com5 bigchance"] == null
        ? (lp.f.cache["com5 bigchance"] = lp.f.randomizer.hd(
            0,
            0.9,
            "com5 bigchance"
          ))
        : lp.f.cache["com5 bigchance"]) * bn
    )
  ) {
    while (
      lp.r.sb(
        (lp.f.cache["com5 bigincchance"] == null
          ? (lp.f.cache["com5 bigincchance"] = lp.f.randomizer.hd(
              0,
              0.8,
              "com5 bigincchance"
            ))
          : lp.f.cache["com5 bigincchance"]) * bn
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
  var lightmid = lp.r.sd(0.75, 1);
  var lightedge = lp.r.sd(0, 0.25);
  var basecolor = lp.f.getBaseColor(lp);
  var colormid = colorToHex(scaleColorBy(basecolor, lightmid));
  var coloredge = colorToHex(scaleColorBy(basecolor, lightedge));
  var countx =
    1 +
    lp.r.sseq(
      lp.f.cache["com5 multxc"] == null
        ? (lp.f.cache["com5 multxc"] = lp.f.randomizer.hd(0, 1, "com5 multxc"))
        : lp.f.cache["com5 multxc"],
      Math.floor(1.2 * Math.pow(lcms / COMPONENT_MAXIMUM_SIZE, 0.6))
    );
  var county =
    1 +
    lp.r.sseq(
      lp.f.cache["com5 multyc"] == null
        ? (lp.f.cache["com5 multyc"] = lp.f.randomizer.hd(0, 1, "com5 multyc"))
        : lp.f.cache["com5 multyc"],
      Math.floor(1.2 * Math.pow(lcms / COMPONENT_MAXIMUM_SIZE, 0.6))
    );
  var smallr = (lp.r.sd(0.5, 1) * lcms) / Math.max(countx, county);
  var drawr = smallr + 0.5;
  var shadowr = smallr + 1;
  var centerr = smallr * 0.2;
  var hw = smallr * countx;
  var hh = smallr * county;
  var bv = [v[0] - hw, v[1] - hh];
  lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.2) + ")";
  for (var ax = 0; ax < countx; ax++) {
    var px = bv[0] + (ax * 2 + 1) * smallr;
    for (var ay = 0; ay < county; ay++) {
      var py = bv[1] + (ay * 2 + 1) * smallr;
      lp.cfx.beginPath();
      lp.cfx.arc(px, py, shadowr, 0, 2 * Math.PI);
      lp.cfx.fill();
    }
  }
  for (var ax = 0; ax < countx; ax++) {
    var px = bv[0] + (ax * 2 + 1) * smallr;
    for (var ay = 0; ay < county; ay++) {
      var py = bv[1] + (ay * 2 + 1) * smallr;
      var grad = lp.cfx.createRadialGradient(px, py, centerr, px, py, drawr);
      grad.addColorStop(0, colormid);
      grad.addColorStop(1, coloredge);
      lp.cfx.fillStyle = grad;
      lp.cfx.beginPath();
      lp.cfx.arc(px, py, drawr, 0, 2 * Math.PI);
      lp.cfx.fill();
    }
  }
};

components[6] = function (
  lp,
  v //Forward-facing trapezoidal fin
) {
  if (lp.nextpass <= 0 || lp.r.sb(frontness(lp, v))) {
    components[lp.r.schoose(copyArray(lp.f.componentChances, 0, 5))](lp, v);
    return;
  }
  let lcms = COMPONENT_MAXIMUM_SIZE;
  var bn = Math.pow(bigness(lp, v), 0.05);
  if (
    lp.r.sb(
      (lp.f.cache["com6 bigchance"] == null
        ? (lp.f.cache["com6 bigchance"] = lp.f.randomizer.hd(
            0,
            0.9,
            "com6 bigchance"
          ))
        : lp.f.cache["com6 bigchance"]) * bn
    )
  ) {
    while (
      lp.r.sb(
        (lp.f.cache["com6 bigincchance"] == null
          ? (lp.f.cache["com6 bigincchance"] = lp.f.randomizer.hd(
              0,
              0.8,
              "com6 bigincchance"
            ))
          : lp.f.cache["com6 bigincchance"]) * bn
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
  var h0 = Math.ceil(lcms * 2 * lp.r.sd(0.6, 1)); //Inner height, longer.
  var hh0i = Math.floor(h0 / 2);
  var hh0e = h0 % 2;
  var h1 =
    h0 *
    Math.pow(
      lp.r.sd(
        lp.f.cache["com6 h1min"] == null
          ? (lp.f.cache["com6 h1min"] = Math.pow(
              lp.f.randomizer.hd(0, 0.8, "com6 h1min"),
              0.5
            ))
          : lp.f.cache["com6 h1min"],
        0.9
      ),
      lp.f.cache["com6 h1power"] == null
        ? (lp.f.cache["com6 h1power"] = lp.f.randomizer.hd(
            0.5,
            1.5,
            "com6 h1power"
          ))
        : lp.f.cache["com6 h1power"]
    ); //Outer height, shorter.
  var hh1i = Math.floor(h1 / 2);
  var hh1e = h0 % 2;
  var backamount = Math.max(
    0 - (h0 - h1) / 2,
    h0 *
      (lp.r.sd(0, 0.45) + lp.r.sd(0, 0.45)) *
      (lp.f.cache["com6 backness"] == null
        ? (lp.f.cache["com6 backness"] = lp.f.randomizer.hb(
            0.8,
            "com6 backnesstype"
          )
            ? lp.f.randomizer.hd(0.2, 0.9, "com6 backness#pos")
            : lp.f.randomizer.hd(-0.2, -0.05, "com6 backness#neg"))
        : lp.f.cache["com6 backness"])
  );
  var w = Math.ceil(
    lcms *
      lp.r.sd(0.7, 1) *
      (lp.f.cache["com6 width"] == null
        ? (lp.f.cache["com6 width"] = Math.pow(
            lp.f.randomizer.hd(0.1, 3.5, "com6 width"),
            0.5
          ))
        : lp.f.cache["com6 width"])
  );
  var hwi = Math.floor(w / 2);
  var hwe = w % 2;
  var quad = [
    [v[0] - hwi, v[1] + backamount - hh1i],
    [v[0] + hwi + hwe, v[1] - hh0i],
    [v[0] + hwi + hwe, v[1] + hh0i + hh0e],
    [v[0] - hwi, v[1] + backamount + hh1i + hh1e],
  ];
  var basecolor = lp.f.getBaseColor(lp);
  lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.2) + ")";
  lp.cfx.beginPath();
  lp.cfx.moveTo(quad[0][0] - 1, quad[0][1]);
  lp.cfx.lineTo(quad[1][0] - 1, quad[1][1]);
  lp.cfx.lineTo(quad[2][0] - 1, quad[2][1]);
  lp.cfx.lineTo(quad[3][0] - 1, quad[3][1]);
  lp.cfx.fill();
  lp.cfx.fillStyle = colorToHex(scaleColorBy(basecolor, lp.r.sd(0.7, 1)));
  lp.cfx.beginPath();
  lp.cfx.moveTo(quad[0][0], quad[0][1]);
  lp.cfx.lineTo(quad[1][0], quad[1][1]);
  lp.cfx.lineTo(quad[2][0], quad[2][1]);
  lp.cfx.lineTo(quad[3][0], quad[3][1]);
  lp.cfx.fill();
};

/*
components["cabin !UNUSED"] = function (
  lp,
  v //Cabin
) {
  if (lp.nextpass <= 0 || lp.r.sb(backness(lp, v))) {
    components[lp.r.schoose(copyArray(lp.f.componentChances, 0, 5))](lp, v);
    return;
  }
  var lcms = cms;
  var bn = Math.pow(bigness(lp, v), 0.1);
  if (
    lp.r.sb(
      (lp.f.cache["com7 bigchance"] == null
        ? (lp.f.cache["com7 bigchance"] = lp.f.randomizer.hd(0, 0.9, "com7 bigchance"))
        : lp.f.cache["com7 bigchance"]) * bn
    )
  ) {
    while (
      lp.r.sb(
        (lp.f.cache["com7 bigincchance"] == null
          ? (lp.f.cache["com7 bigincchance"] = lp.f.randomizer.hd(
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
      ? (lp.f.cache["com7 height"] = lp.f.randomizer.hd(0.5, 1, "com7 height"))
      : lp.f.cache["com7 height"]);
  var hh = h / 2;
  var w =
    1 +
    h *
      (lp.f.cache["com7 width"] == null
        ? (lp.f.cache["com7 width"] = lp.f.randomizer.hd(0.3, 0.8, "com7 width"))
        : lp.f.cache["com7 width"]);
  var hw = w / 2;
  var windowcolor = lp.f.getwindowcolor(lp);
  var lightness0 = lp.r.sd(0.7, 0.9);
  var lightness1 = lp.r.sd(0.4, 0.6);
  var color0 = scaleColorBy(windowcolor, lightness0);
  var color1 = scaleColorBy(windowcolor, lightness1);
  var transparency =
    lp.f.cache["com7 transparency"] == null
      ? (lp.f.cache["com7 transparency"] = lp.f.randomizer.hd(0.3, 0.5, "com7 transparency"))
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
