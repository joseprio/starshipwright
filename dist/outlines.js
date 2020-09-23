import { CANVAS_SHIP_EDGE, COMPONENT_GRID_SIZE } from "./constants";
import { clamp } from "./utils";
//Each outline function takes a single argument 'lp' denoting the ship to draw the outline for.
export const outlines = [];
//Joined rectangles.
outlines[0] = function (lp) {
    const csarea = (lp.w - 2 * CANVAS_SHIP_EDGE) * (lp.h - 2 * CANVAS_SHIP_EDGE);
    const csarealimit = csarea * 0.05;
    const initialwidth = Math.ceil((lp.w - 2 * CANVAS_SHIP_EDGE) * lp.f.r.hd(0.1, 1, "outline0 iw") * 0.2);
    const blocks = [
        [
            [lp.hw - initialwidth, CANVAS_SHIP_EDGE],
            [lp.hw + initialwidth, lp.h - CANVAS_SHIP_EDGE],
        ],
    ];
    const blockcount = 2 +
        Math.floor(lp.r.sd(0.5, 1) * lp.f.r.hd(2, 8, "outline0 bc") * Math.sqrt(lp.size));
    for (let i = 1; i < blockcount; i++) {
        const base = blocks[lp.r.si(0, blocks.length - 1)];
        const v0 = [
            base[0][0] + lp.r.sd(0, 1) * (base[1][0] - base[0][0]),
            base[0][1] + lp.r.sd(0, 1) * (base[1][1] - base[0][1]),
        ];
        if (v0[1] < (base[0][1] + base[1][1]) * 0.5 &&
            lp.r.sb(lp.f.r.hd(0.5, 1.5, "outline0 frontbias"))) {
            v0[1] = base[1][1] - (v0[1] - base[0][1]);
        }
        const v1 = [
            clamp(lp.r.sd(0, 1) * lp.w, CANVAS_SHIP_EDGE, lp.w - CANVAS_SHIP_EDGE),
            clamp(lp.r.sd(0, 1) * lp.h, CANVAS_SHIP_EDGE, lp.h - CANVAS_SHIP_EDGE),
        ];
        const area = Math.abs((v1[0] - v0[0]) * (v1[1] - v0[1]));
        const ratio = csarealimit / area;
        if (ratio < 1) {
            v1[0] = v0[0] + (v1[0] - v0[0]) * ratio;
            v1[1] = v0[1] + (v1[1] - v0[1]) * ratio;
        }
        if (v0[0] > v1[0]) {
            const t = v0[0];
            v0[0] = v1[0];
            v1[0] = t;
        }
        if (v0[1] > v1[1]) {
            const t = v0[1];
            v0[1] = v1[1];
            v1[1] = t;
        }
        blocks.push([
            [Math.floor(v0[0]), Math.floor(v0[1])],
            [Math.ceil(v1[0]), Math.ceil(v1[1])],
        ]);
    }
    lp.csx.fillStyle = "#FFFFFF";
    for (let i = 0; i < blocks.length; i++) {
        const lb = blocks[i];
        lp.csx.fillRect(lb[0][0], lb[0][1], lb[1][0] - lb[0][0], lb[1][1] - lb[0][1]);
        lp.csx.fillRect(lp.w - lb[1][0], lb[0][1], lb[1][0] - lb[0][0], lb[1][1] - lb[0][1]);
    }
};
//Joined circles
outlines[1] = function (lp) {
    const csarea = (lp.w - 2 * CANVAS_SHIP_EDGE) * (lp.h - 2 * CANVAS_SHIP_EDGE);
    const csarealimit = csarea * 0.05;
    const csrlimit = Math.max(2, Math.sqrt(csarealimit / Math.PI));
    const initialwidth = Math.ceil((lp.w - 2 * CANVAS_SHIP_EDGE) * lp.f.r.hd(0.1, 1, "outline1 iw") * 0.2);
    const circles = [];
    const initialcount = Math.floor((lp.h - 2 * CANVAS_SHIP_EDGE) / (initialwidth * 2));
    for (let i = 0; i < initialcount; i++) {
        let lv = [lp.hw, lp.h - (CANVAS_SHIP_EDGE + initialwidth * (i * 2 + 1))];
        circles.push({ v: lv, r: initialwidth });
    }
    const circlecount = initialcount +
        Math.floor(lp.r.sd(0.5, 1) * lp.f.r.hd(10, 50, "outline1 cc") * Math.sqrt(lp.size));
    for (let i = initialcount; i < circlecount; i++) {
        const base = circles[Math.max(lp.r.si(0, circles.length - 1), lp.r.si(0, circles.length - 1))];
        let ncr = lp.r.sd(1, csrlimit);
        const pr = lp.r.sd(Math.max(0, base.r - ncr), base.r);
        let pa = lp.r.sd(0, 2 * Math.PI);
        if (pa > Math.PI && lp.r.sb(lp.f.r.hd(0.5, 1.5, "outline1 frontbias"))) {
            pa = lp.r.sd(0, Math.PI);
        }
        let lv = [base.v[0] + Math.cos(pa) * pr, base.v[1] + Math.sin(pa) * pr];
        ncr = Math.min(ncr, lv[0] - CANVAS_SHIP_EDGE);
        ncr = Math.min(ncr, lp.w - CANVAS_SHIP_EDGE - lv[0]);
        ncr = Math.min(ncr, lv[1] - CANVAS_SHIP_EDGE);
        ncr = Math.min(ncr, lp.h - CANVAS_SHIP_EDGE - lv[1]);
        circles.push({ v: lv, r: ncr });
    }
    lp.csx.fillStyle = "#fff";
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
outlines[2] = function (lp) {
    const innersize = [lp.w - 2 * CANVAS_SHIP_EDGE, lp.h - 2 * CANVAS_SHIP_EDGE];
    const points = [
        [lp.hw, lp.r.sd(0, 0.05) * innersize[1] + CANVAS_SHIP_EDGE],
        [lp.hw, lp.r.sd(0.95, 1) * innersize[1] + CANVAS_SHIP_EDGE],
    ];
    const basefatness = COMPONENT_GRID_SIZE / lp.size +
        lp.f.r.hd(0.03, 0.1, "outline2 basefatness");
    const basemessiness = 1 / basefatness;
    const pointcount = Math.max(3, Math.ceil(basemessiness * lp.r.sd(0.05, 0.1) * Math.sqrt(lp.size)));
    // @ts-ignore - We're doing it properly
    lp.csx.lineCap = ["round", "square"][lp.f.r.hi(0, 1, "outline2 linecap")];
    lp.csx.strokeStyle = "#fff";
    for (let npi = 1; npi < pointcount; npi++) {
        let np = points[npi];
        if (np == null) {
            np = [
                lp.r.sd(0, 1) * innersize[0] + CANVAS_SHIP_EDGE,
                Math.pow(lp.r.sd(0, 1), lp.f.r.hd(0.1, 1, "outline2 frontbias")) *
                    innersize[1] +
                    CANVAS_SHIP_EDGE,
            ];
            points.push(np);
        }
        const cons = 1 + lp.r.sseq(lp.f.r.hd(0, 1, "outline2 conadjust"), 3);
        for (let nci = 0; nci < cons; nci++) {
            const pre = points[lp.r.si(0, points.length - 2)];
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
