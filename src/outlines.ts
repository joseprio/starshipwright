import { CANVAS_SHIP_EDGE, COMPONENT_GRID_SIZE } from "./constants";
import { clamp } from "./utils";
import { Ship } from "./ship";

//Each outline function takes a single argument 'lp' denoting the ship to draw the outline for.
export const outlines = [];

//Joined rectangles.
outlines[0] = function (lp: Ship) {
  var csarea = (lp.w - 2 * CANVAS_SHIP_EDGE) * (lp.h - 2 * CANVAS_SHIP_EDGE);
  var csarealimit = csarea * 0.05;
  var initialwidth = Math.ceil(
    (lp.w - 2 * CANVAS_SHIP_EDGE) *
      (lp.f.cache["outline0 iw"] == null
        ? (lp.f.cache["outline0 iw"] = lp.f.randomizer.hd(
            0.1,
            1,
            "outline0 iw"
          ))
        : lp.f.cache["outline0 iw"]) *
      0.2
  );
  var blocks = [
    [
      [lp.hw - initialwidth, CANVAS_SHIP_EDGE],
      [lp.hw + initialwidth, lp.h - CANVAS_SHIP_EDGE],
    ],
  ];
  if (lp.f.cache["outline0 bc"] == null) {
    lp.f.cache["outline0 bc"] = lp.f.randomizer.hd(2, 8, "outline0 bc");
  }
  var blockcount =
    2 +
    Math.floor(
      lp.r.sd(0.5, 1) * lp.f.cache["outline0 bc"] * Math.sqrt(lp.size)
    );
  for (var i = 1; i < blockcount; i++) {
    var base = blocks[lp.r.si(0, blocks.length - 1)];
    var v0 = [
      base[0][0] + lp.r.sd(0, 1) * (base[1][0] - base[0][0]),
      base[0][1] + lp.r.sd(0, 1) * (base[1][1] - base[0][1]),
    ];
    if (
      v0[1] < (base[0][1] + base[1][1]) * 0.5 &&
      lp.r.sb(
        lp.f.cache["outline0 frontbias"] == null
          ? (lp.f.cache["outline0 frontbias"] = lp.f.randomizer.hd(
              0.5,
              1.5,
              "outline0 frontbias"
            ))
          : lp.f.cache["outline0 frontbias"]
      )
    ) {
      v0[1] = base[1][1] - (v0[1] - base[0][1]);
    }
    var v1 = [
      clamp(lp.r.sd(0, 1) * lp.w, CANVAS_SHIP_EDGE, lp.w - CANVAS_SHIP_EDGE),
      clamp(lp.r.sd(0, 1) * lp.h, CANVAS_SHIP_EDGE, lp.h - CANVAS_SHIP_EDGE),
    ];
    var area = Math.abs((v1[0] - v0[0]) * (v1[1] - v0[1]));
    var ratio = csarealimit / area;
    if (ratio < 1) {
      v1[0] = v0[0] + (v1[0] - v0[0]) * ratio;
      v1[1] = v0[1] + (v1[1] - v0[1]) * ratio;
    }
    if (v0[0] > v1[0]) {
      var t = v0[0];
      v0[0] = v1[0];
      v1[0] = t;
    }
    if (v0[1] > v1[1]) {
      var t = v0[1];
      v0[1] = v1[1];
      v1[1] = t;
    }
    blocks.push([
      [Math.floor(v0[0]), Math.floor(v0[1])],
      [Math.ceil(v1[0]), Math.ceil(v1[1])],
    ]);
  }
  lp.csx.fillStyle = "#FFFFFF";
  for (var i = 0; i < blocks.length; i++) {
    var lb = blocks[i];
    lp.csx.fillRect(
      lb[0][0],
      lb[0][1],
      lb[1][0] - lb[0][0],
      lb[1][1] - lb[0][1]
    );
    lp.csx.fillRect(
      lp.w - lb[1][0],
      lb[0][1],
      lb[1][0] - lb[0][0],
      lb[1][1] - lb[0][1]
    );
  }
};

//Joined circles
outlines[1] = function (lp: Ship) {
  var csarea = (lp.w - 2 * CANVAS_SHIP_EDGE) * (lp.h - 2 * CANVAS_SHIP_EDGE);
  var csarealimit = csarea * 0.05;
  var csrlimit = Math.max(2, Math.sqrt(csarealimit / Math.PI));
  var initialwidth = Math.ceil(
    (lp.w - 2 * CANVAS_SHIP_EDGE) *
      (lp.f.cache["outline1 iw"] == null
        ? (lp.f.cache["outline1 iw"] = lp.f.randomizer.hd(
            0.1,
            1,
            "outline1 iw"
          ))
        : lp.f.cache["outline1 iw"]) *
      0.2
  );
  var circles = [];
  var initialcount = Math.floor(
    (lp.h - 2 * CANVAS_SHIP_EDGE) / (initialwidth * 2)
  );
  for (var i = 0; i < initialcount; i++) {
    let lv = [lp.hw, lp.h - (CANVAS_SHIP_EDGE + initialwidth * (i * 2 + 1))];
    circles.push({ v: lv, r: initialwidth });
  }
  if (lp.f.cache["outline1 cc"] == null) {
    lp.f.cache["outline1 cc"] = lp.f.randomizer.hd(10, 50, "outline1 cc");
  }
  var circlecount =
    initialcount +
    Math.floor(
      lp.r.sd(0.5, 1) * lp.f.cache["outline1 cc"] * Math.sqrt(lp.size)
    );
  for (var i = initialcount; i < circlecount; i++) {
    var base =
      circles[
        Math.max(lp.r.si(0, circles.length - 1), lp.r.si(0, circles.length - 1))
      ];
    var ncr = lp.r.sd(1, csrlimit);
    var pr = lp.r.sd(Math.max(0, base.r - ncr), base.r);
    var pa = lp.r.sd(0, 2 * Math.PI);
    if (
      pa > Math.PI &&
      lp.r.sb(
        lp.f.cache["outline1 frontbias"] == null
          ? (lp.f.cache["outline1 frontbias"] = lp.f.randomizer.hd(
              0.5,
              1.5,
              "outline1 frontbias"
            ))
          : lp.f.cache["outline1 frontbias"]
      )
    ) {
      var pa = lp.r.sd(0, Math.PI);
    }
    let lv = [base.v[0] + Math.cos(pa) * pr, base.v[1] + Math.sin(pa) * pr];
    ncr = Math.min(ncr, lv[0] - CANVAS_SHIP_EDGE);
    ncr = Math.min(ncr, lp.w - CANVAS_SHIP_EDGE - lv[0]);
    ncr = Math.min(ncr, lv[1] - CANVAS_SHIP_EDGE);
    ncr = Math.min(ncr, lp.h - CANVAS_SHIP_EDGE - lv[1]);
    circles.push({ v: lv, r: ncr });
  }
  lp.csx.fillStyle = "#FFFFFF";
  for (let i = 0; i < circles.length; i++) {
    const lc = circles[i];
    lp.csx.beginPath();
    lp.csx.arc(lc.v[0], lc.v[1], lc.r, 0, 2 * Math.PI);
    lp.csx.fill();
    lp.csx.beginPath();
    lp.csx.arc(lp.w - lc.v[0], lc.v[1], lc.r, 0, 2 * Math.PI);
    lp.csx.fill();
  }
};

//Mess of lines
outlines[2] = function (lp: Ship) {
  var innersize = [lp.w - 2 * CANVAS_SHIP_EDGE, lp.h - 2 * CANVAS_SHIP_EDGE];
  var points = [
    [lp.hw, lp.r.sd(0, 0.05) * innersize[1] + CANVAS_SHIP_EDGE],
    [lp.hw, lp.r.sd(0.95, 1) * innersize[1] + CANVAS_SHIP_EDGE],
  ];
  var basefatness =
    COMPONENT_GRID_SIZE / lp.size +
    (lp.f.cache["outline2 basefatness"] == null
      ? (lp.f.cache["outline2 basefatness"] = lp.f.randomizer.hd(
          0.03,
          0.1,
          "outline2 basefatness"
        ))
      : lp.f.cache["outline2 basefatness"]);
  var basemessiness = 1 / basefatness;
  var pointcount = Math.max(
    3,
    Math.ceil(basemessiness * lp.r.sd(0.05, 0.1) * Math.sqrt(lp.size))
  );
  // @ts-ignore - We're doing it properly
  lp.csx.lineCap = ["round", "square"][
    lp.f.cache["outline2 linecap"] == null
      ? (lp.f.cache["outline2 linecap"] = lp.f.randomizer.hi(
          0,
          1,
          "outline2 linecap"
        ))
      : lp.f.cache["outline2 linecap"]
  ];
  lp.csx.strokeStyle = "#FFFFFF";
  for (var npi = 1; npi < pointcount; npi++) {
    var np = points[npi];
    if (np == null) {
      np = [
        lp.r.sd(0, 1) * innersize[0] + CANVAS_SHIP_EDGE,
        Math.pow(
          lp.r.sd(0, 1),
          lp.f.cache["outline2 frontbias"] == null
            ? (lp.f.cache["outline2 frontbias"] = lp.f.randomizer.hd(
                0.1,
                1,
                "outline2 frontbias"
              ))
            : lp.f.cache["outline2 frontbias"]
        ) *
          innersize[1] +
          CANVAS_SHIP_EDGE,
      ];
      points.push(np);
    }
    var cons =
      1 +
      lp.r.sseq(
        lp.f.cache["outline2 conadjust"] == null
          ? (lp.f.cache["outline2 conadjust"] = lp.f.randomizer.hd(
              0,
              1,
              "outline2 conadjust"
            ))
          : lp.f.cache["outline2 conadjust"],
        3
      );
    for (var nci = 0; nci < cons; nci++) {
      var pre = points[lp.r.si(0, points.length - 2)];
      lp.csx.lineWidth = lp.r.sd(0.7, 1) * basefatness * lp.size;
      lp.csx.beginPath();
      lp.csx.moveTo(pre[0], pre[1]);
      lp.csx.lineTo(np[0], np[1]);
      lp.csx.stroke();
      lp.csx.beginPath();
      lp.csx.moveTo(lp.w - pre[0], pre[1]);
      lp.csx.lineTo(lp.w - np[0], np[1]);
      lp.csx.stroke();
    }
  }
};
