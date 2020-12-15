import { Randomizer } from "./randomizer";
import { CANVAS_SHIP_EDGE, COMPONENT_GRID_SIZE, COMPONENT_MAXIMUM_SIZE } from "./constants";
import { computeFactionComponentChances, computeFactionColors, } from "./faction";
import { clamp, colorToHex, scaleColorBy } from "./utils";
import { computeBaseColor } from "./faction";
export function buildShip(factionRandomizer, p_seed, size) {
    const componentChances = computeFactionComponentChances(factionRandomizer);
    const colorData = computeFactionColors(factionRandomizer);
    const shipRandomizer = new Randomizer(factionRandomizer.seed + p_seed);
    //The initial overall size of this ship, in pixels
    size =
        size == null
            ? shipRandomizer.sd(factionRandomizer.hd(2.5, 3.5, "size min"), factionRandomizer.hd(5, 7, "size max")) ** 3
            : size;
    const wratio = shipRandomizer.sd(factionRandomizer.hd(0.5, 1, "wratio min"), factionRandomizer.hd(1, 1.3, "wratio max"));
    const hratio = shipRandomizer.sd(factionRandomizer.hd(0.7, 1, "hratio min"), factionRandomizer.hd(1.1, 1.7, "hratio max"));
    const w = Math.floor(size * wratio) + 2 * CANVAS_SHIP_EDGE; // Maximum width of this ship, in pixels
    const hw = Math.floor(w / 2);
    const gw = Math.floor((w - 2 * CANVAS_SHIP_EDGE) / COMPONENT_GRID_SIZE);
    const gwextra = (w - gw * COMPONENT_GRID_SIZE) * 0.5;
    const h = Math.floor(size * hratio) + 2 * CANVAS_SHIP_EDGE; // Maximum height of this ship, in pixels
    const hh = Math.floor(h / 2);
    const gh = Math.floor((h - 2 * CANVAS_SHIP_EDGE) / COMPONENT_GRID_SIZE);
    const ghextra = (h - gh * COMPONENT_GRID_SIZE) * 0.5;
    const cs = document.createElement("canvas"); // Canvas on which the basic outline of the ship is drawn. Ships face upwards, with front towards Y=0
    cs.width = w;
    cs.height = h;
    const csx = cs.getContext("2d");
    // ------ Define outlines ---------------------------------------
    const outlines = [
        // 0: Joined rectangles.
        function () {
            const csarea = (w - 2 * CANVAS_SHIP_EDGE) * (h - 2 * CANVAS_SHIP_EDGE);
            const csarealimit = csarea * 0.05;
            const initialWidth = Math.ceil((w - 2 * CANVAS_SHIP_EDGE) * factionRandomizer.hd(0.1, 1, "outline0 iw") * 0.2);
            const blocks = [
                [
                    [hw - initialWidth, CANVAS_SHIP_EDGE],
                    [hw + initialWidth, h - CANVAS_SHIP_EDGE],
                ],
            ];
            const blockcount = 2 +
                Math.floor(shipRandomizer.sd(0.5, 1) * factionRandomizer.hd(2, 8, "outline0 bc") * Math.sqrt(size));
            for (let i = 1; i < blockcount; i++) {
                const base = blocks[shipRandomizer.si(0, blocks.length - 1)];
                const v0 = [
                    base[0][0] + shipRandomizer.sd(0, 1) * (base[1][0] - base[0][0]),
                    base[0][1] + shipRandomizer.sd(0, 1) * (base[1][1] - base[0][1]),
                ];
                if (v0[1] < (base[0][1] + base[1][1]) * 0.5 &&
                    shipRandomizer.sb(factionRandomizer.hd(0.5, 1.5, "outline0 frontbias"))) {
                    v0[1] = base[1][1] - (v0[1] - base[0][1]);
                }
                const v1 = [
                    clamp(shipRandomizer.sd(0, 1) * w, CANVAS_SHIP_EDGE, w - CANVAS_SHIP_EDGE),
                    clamp(shipRandomizer.sd(0, 1) * h, CANVAS_SHIP_EDGE, h - CANVAS_SHIP_EDGE),
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
                csx.fillRect(w - lb[1][0], lb[0][1], lb[1][0] - lb[0][0], lb[1][1] - lb[0][1]);
            }
        },
        // 1: Joined circles
        function () {
            const csarea = (w - 2 * CANVAS_SHIP_EDGE) * (h - 2 * CANVAS_SHIP_EDGE);
            const csarealimit = csarea * 0.05;
            const csrlimit = Math.max(2, Math.sqrt(csarealimit / Math.PI));
            const initialwidth = Math.ceil((w - 2 * CANVAS_SHIP_EDGE) * factionRandomizer.hd(0.1, 1, "outline1 iw") * 0.2);
            const circles = [];
            const initialcount = Math.floor((h - 2 * CANVAS_SHIP_EDGE) / (initialwidth * 2));
            for (let i = 0; i < initialcount; i++) {
                let lv = [hw, h - (CANVAS_SHIP_EDGE + initialwidth * (i * 2 + 1))];
                circles.push({ v: lv, r: initialwidth });
            }
            const circlecount = initialcount +
                Math.floor(shipRandomizer.sd(0.5, 1) * factionRandomizer.hd(10, 50, "outline1 cc") * Math.sqrt(size));
            for (let i = initialcount; i < circlecount; i++) {
                const base = circles[Math.max(shipRandomizer.si(0, circles.length - 1), shipRandomizer.si(0, circles.length - 1))];
                let ncr = shipRandomizer.sd(1, csrlimit);
                const pr = shipRandomizer.sd(Math.max(0, base.r - ncr), base.r);
                let pa = shipRandomizer.sd(0, 2 * Math.PI);
                if (pa > Math.PI && shipRandomizer.sb(factionRandomizer.hd(0.5, 1.5, "outline1 frontbias"))) {
                    pa = shipRandomizer.sd(0, Math.PI);
                }
                let lv = [base.v[0] + Math.cos(pa) * pr, base.v[1] + Math.sin(pa) * pr];
                ncr = Math.min(ncr, lv[0] - CANVAS_SHIP_EDGE, w - CANVAS_SHIP_EDGE - lv[0], lv[1] - CANVAS_SHIP_EDGE, h - CANVAS_SHIP_EDGE - lv[1]);
                circles.push({ v: lv, r: ncr });
            }
            csx.fillStyle = "#fff";
            for (let i = 0; i < circles.length; i++) {
                const lc = circles[i];
                csx.beginPath();
                csx.arc(lc.v[0], lc.v[1], lc.r, 0, 2 * Math.PI);
                csx.fill();
                csx.beginPath();
                csx.arc(w - lc.v[0], lc.v[1], lc.r, 0, 2 * Math.PI);
                csx.fill();
            }
        },
        // 2: Mess of lines
        function () {
            const innersize = [w - 2 * CANVAS_SHIP_EDGE, h - 2 * CANVAS_SHIP_EDGE];
            const points = [
                [hw, shipRandomizer.sd(0, 0.05) * innersize[1] + CANVAS_SHIP_EDGE],
                [hw, shipRandomizer.sd(0.95, 1) * innersize[1] + CANVAS_SHIP_EDGE],
            ];
            const basefatness = COMPONENT_GRID_SIZE / size +
                factionRandomizer.hd(0.03, 0.1, "outline2 basefatness");
            const basemessiness = 1 / basefatness;
            const pointcount = Math.max(3, Math.ceil(basemessiness * shipRandomizer.sd(0.05, 0.1) * Math.sqrt(size)));
            // @ts-ignore - We're doing it properly
            csx.lineCap = ["round", "square"][factionRandomizer.hi(0, 1, "outline2 linecap")];
            csx.strokeStyle = "#fff";
            for (let npi = 1; npi < pointcount; npi++) {
                let np = points[npi];
                if (np == null) {
                    np = [
                        shipRandomizer.sd(0, 1) * innersize[0] + CANVAS_SHIP_EDGE,
                        (shipRandomizer.sd(0, 1) ** factionRandomizer.hd(0.1, 1, "outline2 frontbias")) *
                            innersize[1] +
                            CANVAS_SHIP_EDGE,
                    ];
                    points.push(np);
                }
                const cons = 1 + shipRandomizer.sseq(factionRandomizer.hd(0, 1, "outline2 conadjust"), 3);
                for (let nci = 0; nci < cons; nci++) {
                    const pre = points[shipRandomizer.si(0, points.length - 2)];
                    csx.lineWidth = shipRandomizer.sd(0.7, 1) * basefatness * size;
                    csx.beginPath();
                    csx.moveTo(pre[0], pre[1]);
                    csx.lineTo(np[0], np[1]);
                    csx.stroke();
                    csx.beginPath();
                    csx.moveTo(w - pre[0], pre[1]);
                    csx.lineTo(w - np[0], np[1]);
                    csx.stroke();
                }
            }
        }
    ];
    // ------ End define outlines -----------------------------------
    outlines[factionRandomizer.hchoose([1, 1, 1], "outline type")]();
    const outline = csx.getImageData(0, 0, w, h);
    const cgrid = [];
    for (let gx = 0; gx < gw; gx++) {
        cgrid[gx] = [];
        for (let gy = 0; gy < gh; gy++) {
            cgrid[gx][gy] = {
                gx: gx,
                gy: gy,
                x: Math.floor(gwextra + (gx + 0.5) * COMPONENT_GRID_SIZE),
                y: Math.floor(ghextra + (gy + 0.5) * COMPONENT_GRID_SIZE),
                phase: 0,
            }; // Phase is 0 for unchecked, 1 for checked and good, and -1 for checked and bad
        }
    }
    const goodcells = [
        cgrid[Math.floor(gw / 2)][Math.floor(gh / 2)],
    ];
    let nextcheck = 0;
    while (nextcheck < goodcells.length) {
        const lcell = goodcells[nextcheck];
        if (lcell.gx > 0) {
            const ncell = cgrid[lcell.gx - 1][lcell.gy];
            if (ncell.phase == 0) {
                if (getAlpha(outline, ncell.x, ncell.y) > 0) {
                    ncell.phase = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell.phase = -1;
                }
            }
        }
        if (lcell.gx < gw - 1) {
            const ncell = cgrid[lcell.gx + 1][lcell.gy];
            if (ncell.phase == 0) {
                if (getAlpha(outline, ncell.x, ncell.y) > 0) {
                    ncell.phase = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell.phase = -1;
                }
            }
        }
        if (lcell.gy > 0) {
            const ncell = cgrid[lcell.gx][lcell.gy - 1];
            if (ncell.phase == 0) {
                if (getAlpha(outline, ncell.x, ncell.y) > 0) {
                    ncell.phase = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell.phase = -1;
                }
            }
        }
        if (lcell.gy < gh - 1) {
            const ncell = cgrid[lcell.gx][lcell.gy + 1];
            if (ncell.phase == 0) {
                if (getAlpha(outline, ncell.x, ncell.y) > 0) {
                    ncell.phase = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell.phase = -1;
                }
            }
        }
        nextcheck++;
    }
    for (let i = 0; i < goodcells.length; i++) {
        const lcell = goodcells[i];
        const ocell = cgrid[gw - 1 - lcell.gx][lcell.gy];
        if (ocell.phase != 1) {
            ocell.phase = 1;
            goodcells.push(ocell);
        }
    }
    const passes = factionRandomizer.hi(1, 2, "base component passes");
    const extra = Math.max(1, Math.floor(goodcells.length *
        factionRandomizer.hd(0, 1 / passes, "extra component amount")));
    const totalcomponents = passes * goodcells.length + extra;
    const cf = document.createElement("canvas"); // Canvas on which the actual ship components are drawn. Ships face upwards, with front towards Y=0
    cf.width = w;
    cf.height = h;
    const cfx = cf.getContext("2d");
    // ------ Define components ---------------------------------------
    //Returns the phase of the cell containing (X,Y), or 0 if there is no such cell
    function getCellPhase(x, y) {
        const gx = Math.floor((x - gwextra) / COMPONENT_GRID_SIZE);
        const gy = Math.floor((y - ghextra) / COMPONENT_GRID_SIZE);
        if (gx < 0 || gx >= gw || gy < 0 || gy >= gh) {
            return 0;
        }
        return cgrid[gx][gy].phase;
    }
    function frontness(h, v) {
        return 1 - v[1] / h;
    }
    function centerness(hw, hh, v, doY) {
        let rv = Math.min(1, 1 - Math.abs(v[0] - hw) / hw);
        if (doY) {
            rv = Math.min(rv, 1 - Math.abs(v[1] - hh) / hh);
        }
        return rv;
    }
    function bigness(factionRandomizer, w, h, hw, hh, v, pcdone) {
        const effectCenter = centerness(hw, hh, v, true);
        const effectShipsize = 1 - 1 / ((w + h) / 1000 + 1);
        const effectFaction = factionRandomizer.hd(0, 1, "master bigness") ** 0.5;
        const effectStack = 1 - pcdone;
        return effectCenter * effectShipsize * effectFaction * effectStack;
    }
    function leeway(w, h, boundingBox) {
        return [
            Math.min(boundingBox[0][0] - CANVAS_SHIP_EDGE, w - CANVAS_SHIP_EDGE - boundingBox[1][0]),
            Math.min(boundingBox[0][1] - CANVAS_SHIP_EDGE, h - CANVAS_SHIP_EDGE - boundingBox[1][1]),
        ];
    }
    //lp is the ship. amount is the amount of shadow at the edges, 0 - 1 (the middle is always 0). middlep and edgep should be vectors at the middle and edge of the gradient.
    function shadowGradient(ctx, middlePoint, edgePoint, amount) {
        const grad = ctx.createLinearGradient(edgePoint[0], edgePoint[1], middlePoint[0] * 2 - edgePoint[0], middlePoint[1] * 2 - edgePoint[1]);
        const darkness = `rgba(0,0,0,${clamp(amount, 0, 1)})`;
        grad.addColorStop(0, darkness);
        grad.addColorStop(0.5, "rgba(0,0,0,0)");
        grad.addColorStop(1, darkness);
        return grad;
    }
    // Each component function takes an argument 'lp' (for the ship) and 'v' (an integral 2-vector denoting the center of the component)
    const components = [
        // Bordered block
        function (v) {
            let lcms = COMPONENT_MAXIMUM_SIZE;
            const bn = bigness(factionRandomizer, w, h, hw, hh, v, totaldone / totalcomponents) ** 0.3;
            if (shipRandomizer.sb(factionRandomizer.hd(0, 0.9, "com0 bigchance") * bn)) {
                const chance = factionRandomizer.hd(0, 0.5, "com0 bigincchance");
                while (shipRandomizer.sb(chance * bn)) {
                    const lw = leeway(w, h, [
                        [v[0] - lcms, v[1] - lcms],
                        [v[0] + lcms, v[1] + lcms],
                    ]);
                    if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                        lcms *= 1.5;
                    }
                    else {
                        break;
                    }
                }
            }
            const lcms2 = lcms * 2;
            const dhi = [
                Math.ceil(shipRandomizer.sd(1, Math.max(2, 0.5 * lcms))),
                Math.ceil(shipRandomizer.sd(1, Math.max(2, 0.5 * lcms))),
            ];
            const borderwidth = Math.min(dhi[0], dhi[1]) * shipRandomizer.sd(0.1, 1.2);
            const dho = [dhi[0] + borderwidth * 2, dhi[1] + borderwidth * 2];
            const counts = [Math.ceil(lcms2 / dho[0]), Math.ceil(lcms2 / dho[1])];
            const trv = [
                Math.round((counts[0] * dho[0]) / 2),
                Math.round((counts[1] * dho[1]) / 2),
            ];
            const baseColor = computeBaseColor(factionRandomizer, colorData, shipRandomizer);
            const icolorh = scaleColorBy(baseColor, shipRandomizer.sd(0.4, 1));
            const ocolorh = scaleColorBy(baseColor, shipRandomizer.sd(0.4, 1));
            cfx.fillStyle = "rgba(0,0,0," + shipRandomizer.sd(0, 0.25) + ")";
            cfx.fillRect(v[0] - trv[0] - 1, v[1] - trv[1] - 1, dho[0] * counts[0] + 2, dho[1] * counts[1] + 2);
            cfx.fillStyle = ocolorh;
            cfx.fillRect(v[0] - trv[0], v[1] - trv[1], dho[0] * counts[0], dho[1] * counts[1]);
            cfx.fillStyle = icolorh;
            for (let x = 0; x < counts[0]; x++) {
                const bx = v[0] + borderwidth + x * dho[0] - trv[0];
                for (let y = 0; y < counts[1]; y++) {
                    const by = v[1] + borderwidth + y * dho[1] - trv[1];
                    cfx.fillRect(bx, by, dhi[0], dhi[1]);
                }
            }
            if (shipRandomizer.sb(clamp((totaldone * 0.6 / totalcomponents + 0.3) * (lcms / COMPONENT_MAXIMUM_SIZE), 0, 0.98))) {
                cfx.fillStyle = shadowGradient(cfx, v, [v[0] + trv[0], v[1]], shipRandomizer.sd(0, 0.9));
                cfx.fillRect(v[0] - trv[0], v[1] - trv[1], dho[0] * counts[0], dho[1] * counts[1]);
            }
        },
        // Cylinder array
        function (v) {
            let lcms = COMPONENT_MAXIMUM_SIZE;
            const bn = bigness(factionRandomizer, w, h, hw, hh, v, totaldone / totalcomponents) ** 0.2;
            if (shipRandomizer.sb(factionRandomizer.hd(0.3, 1, "com1 bigchance") * bn)) {
                const chance = factionRandomizer.hd(0, 0.6, "com1 bigincchance");
                while (shipRandomizer.sb(chance * bn)) {
                    const lw = leeway(w, h, [
                        [v[0] - lcms, v[1] - lcms],
                        [v[0] + lcms, v[1] + lcms],
                    ]);
                    if (Math.min(lw[0], lw[1]) > lcms / 2) {
                        lcms *= 1.5;
                    }
                    else {
                        break;
                    }
                }
            }
            let componentWidth = Math.ceil(shipRandomizer.sd(0.8, 2) * lcms);
            const componentHeight = Math.ceil(shipRandomizer.sd(0.8, 2) * lcms);
            const cw = shipRandomizer.si(3, Math.max(4, componentWidth));
            const count = Math.max(1, Math.round(componentWidth / cw));
            componentWidth = count * cw;
            const baseColor = computeBaseColor(factionRandomizer, colorData, shipRandomizer);
            const ccolor = scaleColorBy(baseColor, shipRandomizer.sd(0.5, 1));
            const darkness = shipRandomizer.sd(0.3, 0.9);
            // true = horizontal array, false = vertical array
            const orientation = shipRandomizer.sb(clamp(factionRandomizer.hd(-0.2, 1.2, "com1 hchance"), 0, 1));
            if (orientation) {
                const bv = [v[0] - Math.floor(componentWidth / 2), v[1] - Math.floor(componentHeight / 2)];
                cfx.fillStyle = "rgba(0,0,0," + shipRandomizer.sd(0, 0.25) + ")";
                cfx.fillRect(bv[0] - 1, bv[1] - 1, componentWidth + 2, componentHeight + 2);
                cfx.fillStyle = ccolor;
                cfx.fillRect(bv[0], bv[1], componentWidth, componentHeight);
                for (let i = 0; i < count; i++) {
                    cfx.fillStyle = shadowGradient(cfx, [bv[0] + (i + 0.5) * cw, v[1]], [bv[0] + i * cw, v[1]], darkness);
                    cfx.fillRect(bv[0] + i * cw, bv[1], cw, componentHeight);
                }
            }
            else {
                const bv = [v[0] - Math.floor(componentHeight / 2), v[1] - Math.floor(componentWidth / 2)];
                cfx.fillStyle = "rgba(0,0,0," + shipRandomizer.sd(0, 0.25) + ")";
                cfx.fillRect(bv[0] - 1, bv[1] - 1, componentHeight + 2, componentWidth + 2);
                cfx.fillStyle = ccolor;
                cfx.fillRect(bv[0], bv[1], componentHeight, componentWidth);
                for (let i = 0; i < count; i++) {
                    cfx.fillStyle = shadowGradient(cfx, [v[0], bv[1] + (i + 0.5) * cw], [v[0], bv[1] + i * cw], darkness);
                    cfx.fillRect(bv[0], bv[1] + i * cw, componentWidth, cw);
                }
            }
        },
        // Banded cylinder
        function (v) {
            let lcms = COMPONENT_MAXIMUM_SIZE;
            const bn = bigness(factionRandomizer, w, h, hw, hh, v, totaldone / totalcomponents) ** 0.05;
            if (shipRandomizer.sb(factionRandomizer.hd(0, 1, "com2 bigchance") * bn)) {
                const chance = factionRandomizer.hd(0, 0.9, "com2 bigincchance");
                while (shipRandomizer.sb(chance * bn)) {
                    const lw = leeway(w, h, [
                        [v[0] - lcms, v[1] - lcms],
                        [v[0] + lcms, v[1] + lcms],
                    ]);
                    if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                        lcms *= 1.5;
                    }
                    else {
                        break;
                    }
                }
            }
            const componentWidth = Math.ceil(shipRandomizer.sd(0.6, 1.4) * lcms);
            const componentHeight = Math.ceil(shipRandomizer.sd(1, 2) * lcms);
            const wh2 = [
                Math.ceil(clamp((componentWidth * shipRandomizer.sd(0.7, 1)) / 2, 1, componentWidth)),
                Math.ceil(clamp((componentWidth * shipRandomizer.sd(0.8, 1)) / 2, 1, componentWidth)),
            ];
            const h2 = [
                Math.floor(clamp(componentWidth * shipRandomizer.sd(0.05, 0.25), 1, componentHeight)),
                Math.floor(clamp(componentWidth * shipRandomizer.sd(0.1, 0.3), 1, componentHeight)),
            ];
            const hpair = h2[0] + h2[1];
            const odd = shipRandomizer.sb(factionRandomizer.hd(0, 1, "com2 oddchance") ** 0.5);
            const count = clamp(Math.floor(componentHeight / hpair), 1, componentHeight);
            const htotal = count * hpair + (odd ? h2[0] : 0);
            const baseColor = computeBaseColor(factionRandomizer, colorData, shipRandomizer);
            const scale_0 = shipRandomizer.sd(0.6, 1);
            const scale_1 = shipRandomizer.sd(0.6, 1);
            const color2 = [
                scaleColorBy(baseColor, scale_0),
                scaleColorBy(baseColor, scale_1),
            ];
            const lightness = 1 - shipRandomizer.sd(0.5, 0.95);
            const colord2 = [
                scaleColorBy(baseColor, lightness * scale_0),
                scaleColorBy(baseColor, lightness * scale_1),
            ];
            const orientation = shipRandomizer.sb(factionRandomizer.hd(0, 1, "com2 verticalchance") ** 0.1);
            if (orientation) {
                const grad2_0 = cfx.createLinearGradient(v[0] - wh2[0], v[1], v[0] + wh2[0], v[1]);
                const grad2_1 = cfx.createLinearGradient(v[0] - wh2[1], v[1], v[0] + wh2[1], v[1]);
                grad2_0.addColorStop(0, colord2[0]);
                grad2_0.addColorStop(0.5, color2[0]);
                grad2_0.addColorStop(1, colord2[0]);
                grad2_1.addColorStop(0, colord2[1]);
                grad2_1.addColorStop(0.5, color2[1]);
                grad2_1.addColorStop(1, colord2[1]);
                const by = Math.floor(v[1] - htotal / 2);
                for (let i = 0; i < count; i++) {
                    cfx.fillStyle = grad2_0;
                    cfx.fillRect(v[0] - wh2[0], by + i * hpair, wh2[0] * 2, h2[0]);
                    cfx.fillStyle = grad2_1;
                    cfx.fillRect(v[0] - wh2[1], by + i * hpair + h2[0], wh2[1] * 2, h2[1]);
                }
                if (odd) {
                    cfx.fillStyle = grad2_0;
                    cfx.fillRect(v[0] - wh2[0], by + count * hpair, wh2[0] * 2, h2[0]);
                }
            }
            else {
                const grad2_0 = cfx.createLinearGradient(v[0], v[1] - wh2[0], v[0], v[1] + wh2[0]);
                const grad2_1 = cfx.createLinearGradient(v[0], v[1] - wh2[1], v[0], v[1] + wh2[1]);
                grad2_0.addColorStop(0, colord2[0]);
                grad2_0.addColorStop(0.5, color2[0]);
                grad2_0.addColorStop(1, colord2[0]);
                grad2_1.addColorStop(0, colord2[1]);
                grad2_1.addColorStop(0.5, color2[1]);
                grad2_1.addColorStop(1, colord2[1]);
                const bx = Math.floor(v[0] - htotal / 2);
                for (let i = 0; i < count; i++) {
                    cfx.fillStyle = grad2_0;
                    cfx.fillRect(bx + i * hpair, v[1] - wh2[0], h2[0], wh2[0] * 2);
                    cfx.fillStyle = grad2_1;
                    cfx.fillRect(bx + i * hpair + h2[0], v[1] - wh2[1], h2[1], wh2[1] * 2);
                }
                if (odd) {
                    cfx.fillStyle = grad2_0;
                    cfx.fillRect(bx + count * hpair, v[1] - wh2[0], h2[0], wh2[0] * 2);
                }
            }
        },
        //Rocket engine (or tries to call another random component if too far forward)
        function (v) {
            if (shipRandomizer.sb(frontness(h, v) - 0.3) ||
                getCellPhase(v[0], v[1] + COMPONENT_GRID_SIZE * 1.2) > 0 ||
                getCellPhase(v[0], v[1] + COMPONENT_GRID_SIZE * 1.8) > 0) {
                for (let tries = 0; tries < 100; tries++) {
                    const which = shipRandomizer.schoose(componentChances);
                    if (which != 3) {
                        components[which](v);
                        return;
                    }
                }
            }
            let lcms = COMPONENT_MAXIMUM_SIZE;
            const bn = bigness(factionRandomizer, w, h, hw, hh, v, totaldone / totalcomponents) ** 0.1;
            if (shipRandomizer.sb(factionRandomizer.hd(0.6, 1, "com3 bigchance") * bn)) {
                const chance = factionRandomizer.hd(0.3, 0.8, "com3 bigincchance");
                while (shipRandomizer.sb(chance * bn)) {
                    const lw = leeway(w, h, [
                        [v[0] - lcms, v[1] - lcms],
                        [v[0] + lcms, v[1] + lcms],
                    ]);
                    if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                        lcms *= 1.5;
                    }
                    else {
                        break;
                    }
                }
            }
            const componentWidth = shipRandomizer.sd(1, 2) * lcms;
            let componentHeight = Math.ceil(shipRandomizer.sd(0.3, 1) * lcms);
            const nratio = shipRandomizer.sd(0.25, 0.6);
            const nw = componentWidth * nratio;
            const midw = (componentWidth + nw) / 2;
            const midwh = midw / 2;
            const componentHeight2 = [
                Math.max(1, Math.ceil(componentHeight * shipRandomizer.sd(0.08, 0.25))),
                Math.max(1, Math.ceil(componentHeight * shipRandomizer.sd(0.03, 0.15))),
            ];
            const hpair = componentHeight2[0] + componentHeight2[1];
            const count = Math.ceil(componentHeight / hpair);
            componentHeight = count * hpair + componentHeight2[0];
            const [colors, colorChances] = colorData;
            const basecolor = colors[factionRandomizer.hchoose(colorChances, "com3 basecolor")];
            const lightness0_mid = factionRandomizer.hd(0.5, 0.8, "com3 lightness0 mid");
            const lightness0_edge = lightness0_mid - factionRandomizer.hd(0.2, 0.4, "com3 lightness0 edge");
            const lightness1_edge = factionRandomizer.hd(0, 0.2, "com3 lightness1 edge");
            const grad2 = [
                cfx.createLinearGradient(v[0] - midwh, v[1], v[0] + midwh, v[1]),
                cfx.createLinearGradient(v[0] - midwh, v[1], v[0] + midwh, v[1]),
            ];
            grad2[0].addColorStop(0, scaleColorBy(basecolor, lightness0_edge));
            grad2[0].addColorStop(0.5, scaleColorBy(basecolor, lightness0_mid));
            grad2[0].addColorStop(1, scaleColorBy(basecolor, lightness0_edge));
            grad2[1].addColorStop(0, scaleColorBy(basecolor, lightness1_edge));
            grad2[1].addColorStop(0.5, colorToHex(basecolor));
            grad2[1].addColorStop(1, scaleColorBy(basecolor, lightness1_edge));
            const by = Math.ceil(v[1] - componentHeight / 2);
            cfx.fillStyle = grad2[0];
            cfx.beginPath();
            cfx.moveTo(v[0] - nw / 2, by);
            cfx.lineTo(v[0] + nw / 2, by);
            cfx.lineTo(v[0] + componentWidth / 2, by + componentHeight);
            cfx.lineTo(v[0] - componentWidth / 2, by + componentHeight);
            cfx.fill();
            cfx.fillStyle = grad2[1];
            const byh = [by + componentHeight2[0], by + hpair];
            for (let i = 0; i < count; i++) {
                const lyr = [i * hpair + componentHeight2[0], (i + 1) * hpair];
                const ly = [byh[0] + i * hpair, byh[1] + i * hpair];
                const lw = [
                    (nw + (componentWidth - nw) * (lyr[0] / componentHeight)) / 2,
                    (nw + (componentWidth - nw) * (lyr[1] / componentHeight)) / 2,
                ];
                cfx.beginPath();
                cfx.moveTo(v[0] - lw[0], ly[0]);
                cfx.lineTo(v[0] + lw[0], ly[0]);
                cfx.lineTo(v[0] + lw[1], ly[1]);
                cfx.lineTo(v[0] - lw[1], ly[1]);
                cfx.fill();
            }
        },
        //Elongated cylinder (calls component 0 - 2 on top of its starting point)
        function (v) {
            const cn = centerness(hw, hh, v, false);
            const lightmid = shipRandomizer.sd(0.7, 1);
            const lightedge = shipRandomizer.sd(0, 0.2);
            const baseColor = computeBaseColor(factionRandomizer, colorData, shipRandomizer);
            const colormid = scaleColorBy(baseColor, lightmid);
            const coloredge = scaleColorBy(baseColor, lightedge);
            const componentWidth = Math.max(3, Math.ceil(size *
                (shipRandomizer.sd(0.4, 1) ** 2) *
                factionRandomizer.hd(0.02, 0.1, "com4 maxwidth")));
            const hwi = Math.floor(componentWidth / 2);
            const hwe = componentWidth % 2;
            const forwards = 1 * (factionRandomizer.hd(0, 1, "com4 directionc0") ** 4);
            const backwards = 0.1 * (factionRandomizer.hd(0, 1, "com4 directionc1") ** 4);
            const toCenter = 0.2 * (factionRandomizer.hd(0, 1, "com4 directionc2") ** 4);
            const direction = shipRandomizer.schoose([
                forwards * (2 - cn),
                backwards,
                toCenter * (1 + cn),
            ]);
            let ev = null;
            // Shorter than comparing with 0
            if (!direction) {
                //forwards
                const hlimit = v[1] - CANVAS_SHIP_EDGE;
                const componentHeight = Math.min(Math.max(COMPONENT_MAXIMUM_SIZE, hlimit - shipRandomizer.si(0, COMPONENT_MAXIMUM_SIZE * 2)), Math.floor(0.7 * size * (shipRandomizer.sd(0, 1) ** factionRandomizer.hd(2, 6, "com4 hpower0"))));
                const bb_0_0 = v[0] - hwi, bb_0_1 = v[1] - componentHeight, bb_1_0 = v[0] + hwi + hwe;
                const grad = cfx.createLinearGradient(bb_0_0, bb_0_1, bb_1_0, bb_0_1);
                grad.addColorStop(0, coloredge);
                grad.addColorStop(0.5, colormid);
                grad.addColorStop(1, coloredge);
                cfx.fillStyle = grad;
                cfx.fillRect(bb_0_0, bb_0_1, componentWidth, componentHeight);
                ev = [v[0], v[1] - componentHeight];
            }
            else if (direction == 1) {
                //backwards
                const hlimit = h - (CANVAS_SHIP_EDGE + v[1]);
                const componentHeight = Math.min(Math.max(COMPONENT_MAXIMUM_SIZE, hlimit - shipRandomizer.si(0, COMPONENT_MAXIMUM_SIZE * 2)), Math.floor(0.6 * size * (shipRandomizer.sd(0, 1) ** factionRandomizer.hd(2, 7, "com4 hpower1"))));
                const bb_0_0 = v[0] - hwi, bb_0_1 = v[1], bb_1_0 = v[0] + hwi + hwe;
                const grad = cfx.createLinearGradient(bb_0_0, bb_0_1, bb_1_0, bb_0_1);
                grad.addColorStop(0, coloredge);
                grad.addColorStop(0.5, colormid);
                grad.addColorStop(1, coloredge);
                cfx.fillStyle = grad;
                cfx.fillRect(bb_0_0, bb_0_1, w, componentHeight);
                ev = [v[0], v[1] + componentHeight];
            }
            else if (direction == 2) {
                //to center
                const grad = cfx.createLinearGradient(v[0], v[1] - hwi, v[0], v[1] + hwi + hwe);
                grad.addColorStop(0, coloredge);
                grad.addColorStop(0.5, colormid);
                grad.addColorStop(1, coloredge);
                cfx.fillStyle = grad;
                cfx.fillRect(v[0], v[1] - hwi, Math.ceil(hw - v[0]) + 1, w);
                ev = [hw, v[1]];
            }
            const coverComC = [
                0.6 * (factionRandomizer.hd(0, 1, "com4 covercomc0") ** 2),
                0.2 * (factionRandomizer.hd(0, 1, "com4 covercomc1") ** 2),
                (factionRandomizer.hd(0, 1, "com4 covercomc2") ** 2),
            ];
            components[shipRandomizer.schoose(coverComC)](v);
            if (getCellPhase(ev[0], ev[1]) > 0) {
                const nev = [
                    ev[0] + Math.round(shipRandomizer.sd(-1, 1) * COMPONENT_GRID_SIZE),
                    ev[1] + Math.round(shipRandomizer.sd(-1, 1) * COMPONENT_GRID_SIZE),
                ];
                if (getCellPhase(nev[0], nev[1]) > 0) {
                    components[shipRandomizer.schoose(coverComC)](nev);
                }
                else {
                    components[shipRandomizer.schoose(coverComC)](ev);
                }
            }
        },
        //Ball
        function (v) {
            let lcms = COMPONENT_MAXIMUM_SIZE;
            const bn = bigness(factionRandomizer, w, h, hw, hh, v, totaldone / totalcomponents) ** 0.1;
            if (shipRandomizer.sb(factionRandomizer.hd(0, 0.9, "com5 bigchance") * bn)) {
                const chance = factionRandomizer.hd(0, 0.8, "com5 bigincchance");
                while (shipRandomizer.sb(chance * bn)) {
                    const lw = leeway(w, h, [
                        [v[0] - lcms, v[1] - lcms],
                        [v[0] + lcms, v[1] + lcms],
                    ]);
                    if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                        lcms *= 1.5;
                    }
                    else {
                        break;
                    }
                }
            }
            const lightmid = shipRandomizer.sd(0.75, 1);
            const lightedge = shipRandomizer.sd(0, 0.25);
            const baseColor = computeBaseColor(factionRandomizer, colorData, shipRandomizer);
            const colormid = scaleColorBy(baseColor, lightmid);
            const coloredge = scaleColorBy(baseColor, lightedge);
            const countx = 1 +
                shipRandomizer.sseq(factionRandomizer.hd(0, 1, "com5 multxc"), Math.floor(1.2 * ((lcms / COMPONENT_MAXIMUM_SIZE) ** 0.6)));
            const county = 1 +
                shipRandomizer.sseq(factionRandomizer.hd(0, 1, "com5 multyc"), Math.floor(1.2 * ((lcms / COMPONENT_MAXIMUM_SIZE) ** 0.6)));
            const smallr = (shipRandomizer.sd(0.5, 1) * lcms) / Math.max(countx, county);
            const drawr = smallr + 0.5;
            const shadowr = smallr + 1;
            const centerr = smallr * 0.2;
            const componentHw = smallr * countx;
            const componentHh = smallr * county;
            const bv = [v[0] - componentHw, v[1] - componentHh];
            cfx.fillStyle = "rgba(0,0,0," + shipRandomizer.sd(0, 0.2) + ")";
            for (let ax = 0; ax < countx; ax++) {
                const px = bv[0] + (ax * 2 + 1) * smallr;
                for (let ay = 0; ay < county; ay++) {
                    const py = bv[1] + (ay * 2 + 1) * smallr;
                    cfx.beginPath();
                    cfx.arc(px, py, shadowr, 0, 2 * Math.PI);
                    cfx.fill();
                }
            }
            for (let ax = 0; ax < countx; ax++) {
                const px = bv[0] + (ax * 2 + 1) * smallr;
                for (let ay = 0; ay < county; ay++) {
                    const py = bv[1] + (ay * 2 + 1) * smallr;
                    const grad = cfx.createRadialGradient(px, py, centerr, px, py, drawr);
                    grad.addColorStop(0, colormid);
                    grad.addColorStop(1, coloredge);
                    cfx.fillStyle = grad;
                    cfx.beginPath();
                    cfx.arc(px, py, drawr, 0, 2 * Math.PI);
                    cfx.fill();
                }
            }
        },
        //Forward-facing trapezoidal fin
        function (v) {
            if (nextpass <= 0 || shipRandomizer.sb(frontness(h, v))) {
                components[shipRandomizer.schoose(componentChances.slice(0, 6))](v);
                return;
            }
            let lcms = COMPONENT_MAXIMUM_SIZE;
            const bn = bigness(factionRandomizer, w, h, hw, hh, v, totaldone / totalcomponents) ** 0.05;
            if (shipRandomizer.sb(factionRandomizer.hd(0, 0.9, "com6 bigchance") * bn)) {
                const chance = factionRandomizer.hd(0, 0.8, "com6 bigincchance");
                while (shipRandomizer.sb(chance * bn)) {
                    const lw = leeway(w, h, [
                        [v[0] - lcms, v[1] - lcms],
                        [v[0] + lcms, v[1] + lcms],
                    ]);
                    if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                        lcms *= 1.5;
                    }
                    else {
                        break;
                    }
                }
            }
            const h0 = Math.ceil(lcms * 2 * shipRandomizer.sd(0.6, 1)); //Inner height, longer.
            const hh0i = Math.floor(h0 / 2);
            const hh0e = h0 % 2;
            //Outer height, shorter
            const h1 = h0 *
                (shipRandomizer.sd(factionRandomizer.hd(0, 0.8, "com6 h1min") ** 0.5, 0.9) **
                    factionRandomizer.hd(0.5, 1.5, "com6 h1power"));
            const hh1i = Math.floor(h1 / 2);
            const hh1e = h0 % 2;
            const backamount = Math.max(0 - (h0 - h1) / 2, h0 *
                (shipRandomizer.sd(0, 0.45) + shipRandomizer.sd(0, 0.45)) *
                (factionRandomizer.hb(0.8, "com6 backnesstype")
                    ? factionRandomizer.hd(0.2, 0.9, "com6 backness#pos")
                    : factionRandomizer.hd(-0.2, -0.05, "com6 backness#neg")));
            const componentWidth = Math.ceil(lcms * shipRandomizer.sd(0.7, 1) * (factionRandomizer.hd(0.1, 3.5, "com6 width") ** 0.5));
            const hwi = Math.floor(componentWidth / 2);
            const hwe = componentWidth % 2;
            const quad = [
                [v[0] - hwi, v[1] + backamount - hh1i],
                [v[0] + hwi + hwe, v[1] - hh0i],
                [v[0] + hwi + hwe, v[1] + hh0i + hh0e],
                [v[0] - hwi, v[1] + backamount + hh1i + hh1e],
            ];
            const baseColor = computeBaseColor(factionRandomizer, colorData, shipRandomizer);
            cfx.fillStyle = "rgba(0,0,0," + shipRandomizer.sd(0, 0.2) + ")";
            cfx.beginPath();
            cfx.moveTo(quad[0][0] - 1, quad[0][1]);
            cfx.lineTo(quad[1][0] - 1, quad[1][1]);
            cfx.lineTo(quad[2][0] - 1, quad[2][1]);
            cfx.lineTo(quad[3][0] - 1, quad[3][1]);
            cfx.fill();
            cfx.fillStyle = scaleColorBy(baseColor, shipRandomizer.sd(0.7, 1));
            cfx.beginPath();
            cfx.moveTo(quad[0][0], quad[0][1]);
            cfx.lineTo(quad[1][0], quad[1][1]);
            cfx.lineTo(quad[2][0], quad[2][1]);
            cfx.lineTo(quad[3][0], quad[3][1]);
            cfx.fill();
        }
    ];
    // ------ End define outlines -----------------------------------
    // Add components
    let extradone = 0, nextpass = 0, nextcell = 0, totaldone = 0;
    for (;;) {
        let ncell;
        if (nextpass < passes) {
            if (nextcell < goodcells.length) {
                ncell = goodcells[nextcell];
                nextcell++;
            }
            else {
                nextpass++;
                ncell = goodcells[0];
                nextcell = 1;
            }
        }
        else if (extradone < extra) {
            ncell = goodcells[shipRandomizer.si(0, goodcells.length - 1)];
            extradone++;
        }
        else {
            break;
        }
        let lv = [ncell.x, ncell.y];
        for (let t = 0; t < 10; t++) {
            const nv = [
                ncell.x + shipRandomizer.si(-COMPONENT_GRID_SIZE, COMPONENT_GRID_SIZE),
                ncell.y + shipRandomizer.si(-COMPONENT_GRID_SIZE, COMPONENT_GRID_SIZE),
            ];
            if (nv[0] < CANVAS_SHIP_EDGE ||
                nv[0] > w - CANVAS_SHIP_EDGE ||
                nv[1] < CANVAS_SHIP_EDGE ||
                nv[1] > h - CANVAS_SHIP_EDGE) {
                continue;
            }
            if (getAlpha(outline, nv[0], nv[1]) <= 0) {
                continue;
            }
            lv = nv;
            break;
        }
        if (Math.abs(lv[0] - hw) < COMPONENT_GRID_SIZE) {
            if (shipRandomizer.sb(factionRandomizer.hd(0, 1, "com middleness"))) {
                lv[0] = hw;
            }
        }
        components[shipRandomizer.schoose(componentChances)](lv);
        totaldone++;
    }
    // Mirror
    cfx.clearRect(hw + (w % 2), 0, w, h);
    cfx.scale(-1, 1);
    cfx.drawImage(cf, 0 - w, 0);
    return cf;
}
//Returns the alpha value (0 - 255) for the pixel of csd corresponding to the point (X,Y), or -1 if (X,Y) is out of bounds.
function getAlpha(imageData, x, y) {
    if (x < 0 || x > imageData.width || y < 0 || y > imageData.height) {
        return -1;
    }
    return imageData.data[(y * imageData.width + x) * 4 + 3];
}
