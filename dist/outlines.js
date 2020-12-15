import { CANVAS_SHIP_EDGE, COMPONENT_GRID_SIZE } from "./constants";
import { clamp } from "./utils";
//Each outline function takes a single argument 'lp' denoting the ship to draw the outline for.
export const outlines = [
    // 0: Joined rectangles.
    function (lp, csx) {
        const csarea = (lp.w - 2 * CANVAS_SHIP_EDGE) * (lp.h - 2 * CANVAS_SHIP_EDGE);
        const csarealimit = csarea * 0.05;
        const initialWidth = Math.ceil((lp.w - 2 * CANVAS_SHIP_EDGE) * lp.f.hd(0.1, 1, "outline0 iw") * 0.2);
        const blocks = [
            [
                [lp.hw - initialWidth, CANVAS_SHIP_EDGE],
                [lp.hw + initialWidth, lp.h - CANVAS_SHIP_EDGE],
            ],
        ];
        const blockcount = 2 +
            Math.floor(lp.r.sd(0.5, 1) * lp.f.hd(2, 8, "outline0 bc") * Math.sqrt(lp.size));
        for (let i = 1; i < blockcount; i++) {
            const base = blocks[lp.r.si(0, blocks.length - 1)];
            const v0 = [
                base[0][0] + lp.r.sd(0, 1) * (base[1][0] - base[0][0]),
                base[0][1] + lp.r.sd(0, 1) * (base[1][1] - base[0][1]),
            ];
            if (v0[1] < (base[0][1] + base[1][1]) * 0.5 &&
                lp.r.sb(lp.f.hd(0.5, 1.5, "outline0 frontbias"))) {
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
        csx.fillStyle = "#fff";
        for (let i = 0; i < blocks.length; i++) {
            const lb = blocks[i];
            csx.fillRect(lb[0][0], lb[0][1], lb[1][0] - lb[0][0], lb[1][1] - lb[0][1]);
            csx.fillRect(lp.w - lb[1][0], lb[0][1], lb[1][0] - lb[0][0], lb[1][1] - lb[0][1]);
        }
    },
    // 1: Joined circles
    function (lp, csx) {
        const csarea = (lp.w - 2 * CANVAS_SHIP_EDGE) * (lp.h - 2 * CANVAS_SHIP_EDGE);
        const csarealimit = csarea * 0.05;
        const csrlimit = Math.max(2, Math.sqrt(csarealimit / Math.PI));
        const initialwidth = Math.ceil((lp.w - 2 * CANVAS_SHIP_EDGE) * lp.f.hd(0.1, 1, "outline1 iw") * 0.2);
        const circles = [];
        const initialcount = Math.floor((lp.h - 2 * CANVAS_SHIP_EDGE) / (initialwidth * 2));
        for (let i = 0; i < initialcount; i++) {
            let lv = [lp.hw, lp.h - (CANVAS_SHIP_EDGE + initialwidth * (i * 2 + 1))];
            circles.push({ v: lv, r: initialwidth });
        }
        const circlecount = initialcount +
            Math.floor(lp.r.sd(0.5, 1) * lp.f.hd(10, 50, "outline1 cc") * Math.sqrt(lp.size));
        for (let i = initialcount; i < circlecount; i++) {
            const base = circles[Math.max(lp.r.si(0, circles.length - 1), lp.r.si(0, circles.length - 1))];
            let ncr = lp.r.sd(1, csrlimit);
            const pr = lp.r.sd(Math.max(0, base.r - ncr), base.r);
            let pa = lp.r.sd(0, 2 * Math.PI);
            if (pa > Math.PI && lp.r.sb(lp.f.hd(0.5, 1.5, "outline1 frontbias"))) {
                pa = lp.r.sd(0, Math.PI);
            }
            let lv = [base.v[0] + Math.cos(pa) * pr, base.v[1] + Math.sin(pa) * pr];
            ncr = Math.min(ncr, lv[0] - CANVAS_SHIP_EDGE, lp.w - CANVAS_SHIP_EDGE - lv[0], lv[1] - CANVAS_SHIP_EDGE, lp.h - CANVAS_SHIP_EDGE - lv[1]);
            circles.push({ v: lv, r: ncr });
        }
        csx.fillStyle = "#fff";
        for (let i = 0; i < circles.length; i++) {
            const lc = circles[i];
            csx.beginPath();
            csx.arc(lc.v[0], lc.v[1], lc.r, 0, 2 * Math.PI);
            csx.fill();
            csx.beginPath();
            csx.arc(lp.w - lc.v[0], lc.v[1], lc.r, 0, 2 * Math.PI);
            csx.fill();
        }
    },
    // 2: Mess of lines
    function (lp, csx) {
        const innersize = [lp.w - 2 * CANVAS_SHIP_EDGE, lp.h - 2 * CANVAS_SHIP_EDGE];
        const points = [
            [lp.hw, lp.r.sd(0, 0.05) * innersize[1] + CANVAS_SHIP_EDGE],
            [lp.hw, lp.r.sd(0.95, 1) * innersize[1] + CANVAS_SHIP_EDGE],
        ];
        const basefatness = COMPONENT_GRID_SIZE / lp.size +
            lp.f.hd(0.03, 0.1, "outline2 basefatness");
        const basemessiness = 1 / basefatness;
        const pointcount = Math.max(3, Math.ceil(basemessiness * lp.r.sd(0.05, 0.1) * Math.sqrt(lp.size)));
        // @ts-ignore - We're doing it properly
        csx.lineCap = ["round", "square"][lp.f.hi(0, 1, "outline2 linecap")];
        csx.strokeStyle = "#fff";
        for (let npi = 1; npi < pointcount; npi++) {
            let np = points[npi];
            if (np == null) {
                np = [
                    lp.r.sd(0, 1) * innersize[0] + CANVAS_SHIP_EDGE,
                    (lp.r.sd(0, 1) ** lp.f.hd(0.1, 1, "outline2 frontbias")) *
                        innersize[1] +
                        CANVAS_SHIP_EDGE,
                ];
                points.push(np);
            }
            const cons = 1 + lp.r.sseq(lp.f.hd(0, 1, "outline2 conadjust"), 3);
            for (let nci = 0; nci < cons; nci++) {
                const pre = points[lp.r.si(0, points.length - 2)];
                csx.lineWidth = lp.r.sd(0.7, 1) * basefatness * lp.size;
                csx.beginPath();
                csx.moveTo(pre[0], pre[1]);
                csx.lineTo(np[0], np[1]);
                csx.stroke();
                csx.beginPath();
                csx.moveTo(lp.w - pre[0], pre[1]);
                csx.lineTo(lp.w - np[0], np[1]);
                csx.stroke();
            }
        }
    }
];
