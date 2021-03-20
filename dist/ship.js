import { Randomizer } from "./randomizer";
import { computeFactionComponentChances } from "./faction";
import { clamp, scaleColorBy, hsvToRgb } from "./utils";
//Size of the component grid
const COMPONENT_GRID_SIZE = 6;
//Base maximum extent of a component from its origin point. Should be at least equal to cgridsize, but no greater than csedge.
const COMPONENT_MAXIMUM_SIZE = 8;
// This library is heavily optimized towards size, as I used it for a JS13K game. Also, I'm planning to use
// it again for that purpose in the future. This function is a lot bigger than it needs to be, but doing so
// allows us to have all variables we need in the closure instead of passing it around in parameters
export function buildShip(factionRandomizer, p_seed, size) {
    const componentChances = computeFactionComponentChances(factionRandomizer);
    const colors = [];
    const colorChances = [];
    const baseColorCount = 1 +
        (factionRandomizer.hb(0.7, 0 /* BaseColorPlusOne */) ? 1 : 0) +
        factionRandomizer.hseq(0.3, 3, 1 /* BaseColorCount */);
    // Compute faction colors
    for (let i = 0; i < baseColorCount; i++) {
        const ls = "-" + i;
        // Just doing random RGB coloring should be alright and simplify the code
        colors.push(hsvToRgb(factionRandomizer.hd(0, 1, 2 /* BaseColorHue */ + ls) ** 2, clamp(factionRandomizer.hd(-0.2, 1, 3 /* BaseColorSaturation */ + ls), 0, factionRandomizer.hd(0, 1, 4 /* BaseColorSaturationBound */ + ls) ** 4), clamp(factionRandomizer.hd(0.7, 1.1, 5 /* BaseColorValue */ + ls), 0, 1)));
        // Default maximum power is 6
        colorChances.push(2 ** factionRandomizer.hd(0, 6, 6 /* BaseColorChances */ + ls));
    }
    const shipRandomizer = new Randomizer(p_seed);
    function computeBaseColor() {
        let rv = colors[shipRandomizer.schoose(colorChances)];
        return shipRandomizer.sb(factionRandomizer.hd(0, 0.5, 7 /* BaseColorShiftChance */) ** 2) ? [
            clamp(rv[0] +
                factionRandomizer.hd(0, 0.6, 8 /* BaseColorShiftChanceRed */) ** 2 *
                    clamp(shipRandomizer.sd(-1, 1.2), 0, 1) *
                    clamp(shipRandomizer.ss(0.7) + shipRandomizer.ss(0.7), -1, 1), 0, 1),
            clamp(rv[1] +
                factionRandomizer.hd(0, 0.6, 10 /* BaseColorShiftChanceGreen */) ** 2 *
                    clamp(shipRandomizer.sd(-1, 1.2), 0, 1) *
                    clamp(shipRandomizer.ss(0.7) + shipRandomizer.ss(0.7), -1, 1), 0, 1),
            clamp(rv[2] +
                factionRandomizer.hd(0, 0.6, 9 /* BaseColorShiftChanceBlue */) ** 2 *
                    clamp(shipRandomizer.sd(-1, 1.2), 0, 1) *
                    clamp(shipRandomizer.ss(0.7) + shipRandomizer.ss(0.7), -1, 1), 0, 1)
        ] : rv;
    }
    //The initial overall size of this ship, in pixels
    size =
        size ||
            shipRandomizer.sd(factionRandomizer.hd(2.5, 3.5, 11 /* SizeMin */), factionRandomizer.hd(5, 7, 12 /* SizeMax */)) ** 3;
    const wratio = shipRandomizer.sd(factionRandomizer.hd(0.5, 1, 13 /* WidthRationMin */), factionRandomizer.hd(1, 1.3, 14 /* WidthRationMax */));
    const hratio = shipRandomizer.sd(factionRandomizer.hd(0.7, 1, 15 /* HeightRationMin */), factionRandomizer.hd(1.1, 1.7, 16 /* HeightRationMax */));
    const w = Math.floor(size * wratio); // Maximum width of this ship, in pixels
    const hw = Math.floor(w / 2);
    const gw = Math.floor(w / COMPONENT_GRID_SIZE);
    const gwextra = (w - gw * COMPONENT_GRID_SIZE) / 2;
    const h = Math.floor(size * hratio); // Maximum height of this ship, in pixels
    const hh = Math.floor(h / 2);
    const gh = Math.floor(h / COMPONENT_GRID_SIZE);
    const ghextra = (h - gh * COMPONENT_GRID_SIZE) / 2;
    const shipCanvas = document.createElement("canvas"); // Canvas on which the basic outline of the ship is drawn. Ships face upwards, with front towards Y=0
    shipCanvas.width = w;
    shipCanvas.height = h;
    const cx = shipCanvas.getContext("2d");
    const csarealimit = (w * h) / 20;
    // ------ Define outlines ---------------------------------------
    const outlines = [
        // 0: Joined rectangles.
        function () {
            const initialWidth = Math.ceil((w * factionRandomizer.hd(0.1, 1, 17 /* Outline0InitialWidth */)) / 5);
            const blocks = [
                [
                    [hw - initialWidth, 0],
                    [hw + initialWidth, h],
                ],
            ];
            const blockcount = 2 +
                Math.floor(shipRandomizer.sd(0.5, 1) *
                    factionRandomizer.hd(2, 8, 18 /* Outline0BlockCount */) *
                    size ** 0.5);
            for (let i = 1; i < blockcount; i++) {
                const base = blocks[shipRandomizer.si(0, blocks.length - 1)];
                const v0 = [
                    base[0][0] + shipRandomizer.sd(0, 1) * (base[1][0] - base[0][0]),
                    base[0][1] + shipRandomizer.sd(0, 1) * (base[1][1] - base[0][1]),
                ];
                if (v0[1] < (base[0][1] + base[1][1]) / 2 &&
                    shipRandomizer.sb(factionRandomizer.hd(0.5, 1.5, 19 /* Outline0FrontBias */))) {
                    v0[1] = base[1][1] - (v0[1] - base[0][1]);
                }
                const v1 = [
                    shipRandomizer.sd(0, 1) * w,
                    shipRandomizer.sd(0, 1) * h,
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
            cx.fillStyle = "#fff";
            blocks.map(lb => {
                cx.fillRect(lb[0][0], lb[0][1], lb[1][0] - lb[0][0], lb[1][1] - lb[0][1]);
                cx.fillRect(w - lb[1][0], lb[0][1], lb[1][0] - lb[0][0], lb[1][1] - lb[0][1]);
            });
        },
        // 1: Joined circles
        function () {
            const csrlimit = Math.max(2, (csarealimit / Math.PI) ** 0.5);
            const initialwidth = Math.ceil((w * factionRandomizer.hd(0.1, 1, 20 /* Outline1InitialWidth */)) / 5);
            const circles = [];
            const initialcount = Math.floor(h / (initialwidth * 2));
            for (let i = 0; i < initialcount; i++) {
                const lv = [hw, h - initialwidth * (i * 2 + 1)];
                circles.push({ v: lv, r: initialwidth });
            }
            const circlecount = initialcount +
                Math.floor(shipRandomizer.sd(0.5, 1) *
                    factionRandomizer.hd(10, 50, 21 /* Outline1CircleCount */) *
                    size ** 0.5);
            for (let i = initialcount; i < circlecount; i++) {
                const base = circles[Math.max(shipRandomizer.si(0, circles.length - 1), shipRandomizer.si(0, circles.length - 1))];
                let ncr = shipRandomizer.sd(1, csrlimit);
                const pr = shipRandomizer.sd(Math.max(0, base.r - ncr), base.r);
                let pa = shipRandomizer.sd(0, 2 * Math.PI);
                if (pa > Math.PI &&
                    shipRandomizer.sb(factionRandomizer.hd(0.5, 1.5, 22 /* Outline1FrontBias */))) {
                    pa = shipRandomizer.sd(0, Math.PI);
                }
                let lv = [base.v[0] + Math.cos(pa) * pr, base.v[1] + Math.sin(pa) * pr];
                ncr = Math.min(ncr, lv[0], w - lv[0], lv[1], h - lv[1]);
                circles.push({ v: lv, r: ncr });
            }
            cx.fillStyle = "#fff";
            circles.map(lc => {
                cx.beginPath();
                cx.arc(lc.v[0], lc.v[1], lc.r, 0, 7);
                cx.fill();
                cx.beginPath();
                cx.arc(w - lc.v[0], lc.v[1], lc.r, 0, 7);
                cx.fill();
            });
        },
        // 2: Mess of lines
        function () {
            const points = [
                [hw, shipRandomizer.sd(0, 0.05) * h],
                [hw, shipRandomizer.sd(0.95, 1) * h],
            ];
            const basefatness = COMPONENT_GRID_SIZE / size +
                factionRandomizer.hd(0.03, 0.1, 23 /* Outline2BaseFatness */);
            const pointcount = Math.max(3, Math.ceil((shipRandomizer.sd(0.05, 0.1) / basefatness) * size ** 0.5));
            // @ts-ignore - We're doing it properly
            cx.lineCap = ["round", "square"][factionRandomizer.hi(0, 1, 24 /* Outline2LineCap */)];
            cx.strokeStyle = "#fff";
            for (let npi = 1; npi < pointcount; npi++) {
                let np = points[npi];
                if (!np) {
                    np = [
                        shipRandomizer.sd(0, 1) * w,
                        shipRandomizer.sd(0, 1) **
                            factionRandomizer.hd(0.1, 1, 25 /* Outline2FrontBias */) *
                            h,
                    ];
                    points.push(np);
                }
                const cons = 1 +
                    shipRandomizer.sseq(factionRandomizer.hd(0, 1, 26 /* Outline2ConAdjust */), 3);
                for (let nci = 0; nci < cons; nci++) {
                    const pre = points[shipRandomizer.si(0, points.length - 2)];
                    cx.lineWidth = shipRandomizer.sd(0.7, 1) * basefatness * size;
                    cx.beginPath();
                    cx.moveTo(pre[0], pre[1]);
                    cx.lineTo(np[0], np[1]);
                    cx.stroke();
                    cx.beginPath();
                    cx.moveTo(w - pre[0], pre[1]);
                    cx.lineTo(w - np[0], np[1]);
                    cx.stroke();
                }
            }
        },
    ];
    // ------ End define outlines -----------------------------------
    outlines[factionRandomizer.hchoose([1, 1, 1], 27 /* OutlineType */)]();
    const outline = cx.getImageData(0, 0, w, h);
    //Returns the alpha value (0 - 255) for the pixel of csd corresponding to the point (X,Y)
    function getOutlineAlpha(x, y) {
        return outline.data[(y * w + x) * 4 + 3];
    }
    const cgrid = [];
    for (let gx = 0; gx < gw; gx++) {
        cgrid[gx] = [];
        for (let gy = 0; gy < gh; gy++) {
            cgrid[gx][gy] = {
                gx: gx,
                gy: gy,
                x: Math.floor(gwextra + (gx + 0.5) * COMPONENT_GRID_SIZE),
                y: Math.floor(ghextra + (gy + 0.5) * COMPONENT_GRID_SIZE),
            }; // Phase is 0 for unchecked, 1 for checked and good, and -1 for checked and bad
        }
    }
    const goodcells = [cgrid[Math.floor(gw / 2)][Math.floor(gh / 2)]];
    for (let nextcheck = 0; nextcheck < goodcells.length; nextcheck++) {
        const lcell = goodcells[nextcheck];
        if (lcell.gx > 0) {
            const ncell = cgrid[lcell.gx - 1][lcell.gy];
            if (!ncell.phase) {
                if (getOutlineAlpha(ncell.x, ncell.y)) {
                    ncell.phase = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell.phase = 2;
                }
            }
        }
        if (lcell.gx < gw - 1) {
            const ncell = cgrid[lcell.gx + 1][lcell.gy];
            if (!ncell.phase) {
                if (getOutlineAlpha(ncell.x, ncell.y)) {
                    ncell.phase = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell.phase = 2;
                }
            }
        }
        if (lcell.gy > 0) {
            const ncell = cgrid[lcell.gx][lcell.gy - 1];
            if (!ncell.phase) {
                if (getOutlineAlpha(ncell.x, ncell.y)) {
                    ncell.phase = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell.phase = 2;
                }
            }
        }
        if (lcell.gy < gh - 1) {
            const ncell = cgrid[lcell.gx][lcell.gy + 1];
            if (!ncell.phase) {
                if (getOutlineAlpha(ncell.x, ncell.y)) {
                    ncell.phase = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell.phase = 2;
                }
            }
        }
    }
    for (let i = 0; i < goodcells.length; i++) {
        const lcell = goodcells[i];
        const ocell = cgrid[gw - 1 - lcell.gx][lcell.gy];
        if (ocell.phase != 1) {
            ocell.phase = 1;
            goodcells.push(ocell);
        }
    }
    const passes = factionRandomizer.hi(1, 2, 28 /* BaseComponentPasses */);
    const extra = Math.max(1, Math.floor(goodcells.length *
        factionRandomizer.hd(0, 1 / passes, 29 /* ExtraComponentAmount */)));
    const totalcomponents = passes * goodcells.length + extra;
    // Touching the dimensions of the canvas will reset its data
    shipCanvas.width |= 0;
    // ------ Define components ---------------------------------------
    //Returns true if the cell at (X,Y) is good, or false if there is no such cell
    function isCellGood(x, y) {
        const gx = Math.floor((x - gwextra) / COMPONENT_GRID_SIZE);
        const gy = Math.floor((y - ghextra) / COMPONENT_GRID_SIZE);
        if (gx < 0 || gx >= gw || gy < 0 || gy >= gh) {
            return;
        }
        return cgrid[gx][gy].phase == 1;
    }
    function frontness(v) {
        return 1 - v[1] / h;
    }
    function centerness(v, doY) {
        let rv = Math.min(1, 1 - Math.abs(v[0] - hw) / hw);
        if (doY) {
            rv = Math.min(rv, 1 - Math.abs(v[1] - hh) / hh);
        }
        return rv;
    }
    function calculateLcms(componentIndex, v, magnitude, bigChanceLow, bigChanceHigh, bigIncChanceLow, bigIncChanceHigh) {
        const effectCenter = centerness(v, true);
        const effectShipsize = 1 - 1 / ((w + h) / 1000 + 1);
        const effectFaction = factionRandomizer.hd(0, 1, 30 /* MasterBigness */) ** 0.5;
        const effectStack = 1 - totaldone / totalcomponents;
        const bn = (effectCenter * effectShipsize * effectFaction * effectStack) **
            magnitude;
        let lcms = COMPONENT_MAXIMUM_SIZE;
        if (shipRandomizer.sb(factionRandomizer.hd(bigChanceLow, bigChanceHigh, `${31 /* ComponentBigChance */}-${componentIndex}`) * bn)) {
            const chance = factionRandomizer.hd(bigIncChanceLow, bigIncChanceHigh, `${32 /* ComponentBigIncChance */}-${componentIndex}`);
            // Using for as it's smaller, even though it didn't make the zip smaller
            for (; shipRandomizer.sb(chance * bn);) {
                const minLeeway = Math.min(v[0] - lcms, w - v[0] - lcms, v[1] - lcms, h - v[1] - lcms);
                if (minLeeway > lcms / 2) {
                    lcms *= 1.5;
                }
                else {
                    break;
                }
            }
        }
        return lcms;
    }
    //lp is the ship. amount is the amount of shadow at the edges, 0 - 1 (the middle is always 0). middlep and edgep should be vectors at the middle and edge of the gradient.
    function shadowGradient(middlePoint, edgePoint, amount) {
        const grad = cx.createLinearGradient(edgePoint[0], edgePoint[1], middlePoint[0] * 2 - edgePoint[0], middlePoint[1] * 2 - edgePoint[1]);
        const darkness = `rgba(0,0,0,${amount})`;
        grad.addColorStop(0, darkness);
        grad.addColorStop(0.5, `rgba(0,0,0,0)`);
        grad.addColorStop(1, darkness);
        return grad;
    }
    // Each component function takes an argument 'lp' (for the ship) and 'v' (an integral 2-vector denoting the center of the component)
    const components = [
        // Bordered block
        function (v) {
            const lcms = calculateLcms(0, v, 0.3, 0, 0.9, 0, 0.5);
            const lcms2 = lcms * 2;
            const dhi_0 = Math.ceil(shipRandomizer.sd(1, Math.max(2, lcms / 2)));
            const dhi_1 = Math.ceil(shipRandomizer.sd(1, Math.max(2, lcms / 2)));
            const borderwidth = Math.min(dhi_0, dhi_1) * shipRandomizer.sd(0.1, 1.2);
            const dho_0 = dhi_0 + borderwidth * 2;
            const dho_1 = dhi_1 + borderwidth * 2;
            const counts_0 = Math.ceil(lcms2 / dho_0);
            const counts_1 = Math.ceil(lcms2 / dho_1);
            const trv_0 = Math.round((counts_0 * dho_0) / 2);
            const trv_1 = Math.round((counts_1 * dho_1) / 2);
            const baseColor = computeBaseColor();
            cx.fillStyle = `rgba(0,0,0,${shipRandomizer.sd(0, 0.25)})`;
            cx.fillRect(v[0] - trv_0 - 1, v[1] - trv_1 - 1, dho_0 * counts_0 + 2, dho_1 * counts_1 + 2);
            cx.fillStyle = scaleColorBy(baseColor, shipRandomizer.sd(0.4, 1));
            cx.fillRect(v[0] - trv_0, v[1] - trv_1, dho_0 * counts_0, dho_1 * counts_1);
            cx.fillStyle = scaleColorBy(baseColor, shipRandomizer.sd(0.4, 1));
            for (let x = 0; x < counts_0; x++) {
                const bx = v[0] + borderwidth + x * dho_0 - trv_0;
                for (let y = 0; y < counts_1; y++) {
                    const by = v[1] + borderwidth + y * dho_1 - trv_1;
                    cx.fillRect(bx, by, dhi_0, dhi_1);
                }
            }
            if (shipRandomizer.sb(clamp(((totaldone * 0.6) / totalcomponents + 0.3) *
                (lcms / COMPONENT_MAXIMUM_SIZE), 0, 0.98))) {
                cx.fillStyle = shadowGradient(v, [v[0] + trv_0, v[1]], shipRandomizer.sd(0, 0.9));
                cx.fillRect(v[0] - trv_0, v[1] - trv_1, dho_0 * counts_0, dho_1 * counts_1);
            }
        },
        // Cylinder array
        function (v) {
            const lcms = calculateLcms(1, v, 0.2, 0.3, 1, 0, 0.6);
            const baseComponentWidth = Math.ceil(shipRandomizer.sd(0.8, 2) * lcms);
            const componentHeight = Math.ceil(shipRandomizer.sd(0.8, 2) * lcms);
            const cw = shipRandomizer.si(3, Math.max(4, baseComponentWidth));
            const count = Math.max(1, Math.round(baseComponentWidth / cw));
            const componentWidth = count * cw;
            const baseColor = computeBaseColor();
            const ccolor = scaleColorBy(baseColor, shipRandomizer.sd(0.5, 1));
            const darkness = shipRandomizer.sd(0.3, 0.9);
            // true = horizontal array, false = vertical array
            const orientation = shipRandomizer.sb(clamp(factionRandomizer.hd(-0.2, 1.2, 33 /* Component1HChance */), 0, 1));
            if (orientation) {
                const bv = [
                    v[0] - Math.floor(componentWidth / 2),
                    v[1] - Math.floor(componentHeight / 2),
                ];
                cx.fillStyle = `rgba(0,0,0,${shipRandomizer.sd(0, 0.25)})`;
                cx.fillRect(bv[0] - 1, bv[1] - 1, componentWidth + 2, componentHeight + 2);
                cx.fillStyle = ccolor;
                cx.fillRect(bv[0], bv[1], componentWidth, componentHeight);
                for (let i = 0; i < count; i++) {
                    cx.fillStyle = shadowGradient([bv[0] + (i + 0.5) * cw, v[1]], [bv[0] + i * cw, v[1]], darkness);
                    cx.fillRect(bv[0] + i * cw, bv[1], cw, componentHeight);
                }
            }
            else {
                const bv = [
                    v[0] - Math.floor(componentHeight / 2),
                    v[1] - Math.floor(componentWidth / 2),
                ];
                cx.fillStyle = `rgba(0,0,0,${shipRandomizer.sd(0, 0.25)})`;
                cx.fillRect(bv[0] - 1, bv[1] - 1, componentHeight + 2, componentWidth + 2);
                cx.fillStyle = ccolor;
                cx.fillRect(bv[0], bv[1], componentHeight, componentWidth);
                for (let i = 0; i < count; i++) {
                    cx.fillStyle = shadowGradient([v[0], bv[1] + (i + 0.5) * cw], [v[0], bv[1] + i * cw], darkness);
                    cx.fillRect(bv[0], bv[1] + i * cw, componentWidth, cw);
                }
            }
        },
        // Banded cylinder
        function (v) {
            const lcms = calculateLcms(2, v, 0.05, 0, 1, 0, 0.9);
            const componentWidth = Math.ceil(shipRandomizer.sd(0.6, 1.4) * lcms);
            const componentHeight = Math.ceil(shipRandomizer.sd(1, 2) * lcms);
            const wh2_0 = Math.ceil(Math.max((componentWidth * shipRandomizer.sd(0.7, 1)) / 2, 1));
            const wh2_1 = Math.ceil(Math.max((componentWidth * shipRandomizer.sd(0.8, 1)) / 2, 1));
            const h2_0 = Math.floor(clamp(componentWidth * shipRandomizer.sd(0.05, 0.25), 1, componentHeight));
            const h2_1 = Math.floor(clamp(componentWidth * shipRandomizer.sd(0.1, 0.3), 1, componentHeight));
            const hpair = h2_0 + h2_1;
            const odd = shipRandomizer.sb(factionRandomizer.hd(0, 1, 34 /* Component2OddChance */) ** 0.5);
            const count = Math.max(Math.floor(componentHeight / hpair), 1);
            const htotal = count * hpair + (odd ? h2_0 : 0);
            const baseColor = computeBaseColor();
            const scale_0 = shipRandomizer.sd(0.6, 1);
            const scale_1 = shipRandomizer.sd(0.6, 1);
            const color2_0 = scaleColorBy(baseColor, scale_0);
            const color2_1 = scaleColorBy(baseColor, scale_1);
            const lightness = 1 - shipRandomizer.sd(0.5, 0.95);
            const colord2_0 = scaleColorBy(baseColor, lightness * scale_0);
            const colord2_1 = scaleColorBy(baseColor, lightness * scale_1);
            const orientation = shipRandomizer.sb(factionRandomizer.hd(0, 1, 35 /* Component2VerticalChance */) ** 0.1);
            if (orientation) {
                const grad2_0 = cx.createLinearGradient(v[0] - wh2_0, v[1], v[0] + wh2_0, v[1]);
                const grad2_1 = cx.createLinearGradient(v[0] - wh2_1, v[1], v[0] + wh2_1, v[1]);
                const by = Math.floor(v[1] - htotal / 2);
                grad2_0.addColorStop(0, colord2_0);
                grad2_0.addColorStop(0.5, color2_0);
                grad2_0.addColorStop(1, colord2_0);
                grad2_1.addColorStop(0, colord2_1);
                grad2_1.addColorStop(0.5, color2_1);
                grad2_1.addColorStop(1, colord2_1);
                for (let i = 0; i < count; i++) {
                    cx.fillStyle = grad2_0;
                    cx.fillRect(v[0] - wh2_0, by + i * hpair, wh2_0 * 2, h2_0);
                    cx.fillStyle = grad2_1;
                    cx.fillRect(v[0] - wh2_1, by + i * hpair + h2_0, wh2_1 * 2, h2_1);
                }
                if (odd) {
                    cx.fillStyle = grad2_0;
                    cx.fillRect(v[0] - wh2_0, by + count * hpair, wh2_0 * 2, h2_0);
                }
            }
            else {
                const grad2_0 = cx.createLinearGradient(v[0], v[1] - wh2_0, v[0], v[1] + wh2_0);
                const grad2_1 = cx.createLinearGradient(v[0], v[1] - wh2_1, v[0], v[1] + wh2_1);
                const bx = Math.floor(v[0] - htotal / 2);
                grad2_0.addColorStop(0, colord2_0);
                grad2_0.addColorStop(0.5, color2_0);
                grad2_0.addColorStop(1, colord2_0);
                grad2_1.addColorStop(0, colord2_1);
                grad2_1.addColorStop(0.5, color2_1);
                grad2_1.addColorStop(1, colord2_1);
                for (let i = 0; i < count; i++) {
                    cx.fillStyle = grad2_0;
                    cx.fillRect(bx + i * hpair, v[1] - wh2_0, h2_0, wh2_0 * 2);
                    cx.fillStyle = grad2_1;
                    cx.fillRect(bx + i * hpair + h2_0, v[1] - wh2_1, h2_1, wh2_1 * 2);
                }
                if (odd) {
                    cx.fillStyle = grad2_0;
                    cx.fillRect(bx + count * hpair, v[1] - wh2_0, h2_0, wh2_0 * 2);
                }
            }
        },
        //Rocket engine (or tries to call another random component if too far forward)
        function (v) {
            if (shipRandomizer.sb(frontness(v) - 0.3) ||
                isCellGood(v[0], v[1] + COMPONENT_GRID_SIZE * 1.2) ||
                isCellGood(v[0], v[1] + COMPONENT_GRID_SIZE * 1.8)) {
                // Any component but this one
                for (;;) {
                    const which = shipRandomizer.schoose(componentChances);
                    if (which != 3) {
                        components[which](v);
                        return;
                    }
                }
            }
            const lcms = calculateLcms(3, v, 0.1, 0.6, 1, 0.3, 0.8);
            const componentWidth = shipRandomizer.sd(1, 2) * lcms;
            const baseComponentHeight = Math.ceil(shipRandomizer.sd(0.3, 1) * lcms);
            const nw = componentWidth * shipRandomizer.sd(0.25, 0.6);
            ;
            const midwh = (componentWidth + nw) / 4;
            const componentHeight2 = Math.max(1, Math.ceil(baseComponentHeight * shipRandomizer.sd(0.08, 0.25)));
            const hpair = componentHeight2 + Math.max(1, Math.ceil(baseComponentHeight * shipRandomizer.sd(0.03, 0.15)));
            const count = Math.ceil(baseComponentHeight / hpair);
            const componentHeight = count * hpair + componentHeight2;
            const basecolor = colors[factionRandomizer.hchoose(colorChances, 36 /* Component3BaseColor */)];
            const lightness0_mid = factionRandomizer.hd(0.5, 0.8, 38 /* Component3Lightness0Mid */);
            const lightness0_edge = lightness0_mid - factionRandomizer.hd(0.2, 0.4, 37 /* Component3Lightness0Edge */);
            const lightness1_edge = factionRandomizer.hd(0, 0.2, 39 /* Component3Lightness1Edge */);
            const grad2_0 = cx.createLinearGradient(v[0] - midwh, v[1], v[0] + midwh, v[1]);
            const grad2_1 = cx.createLinearGradient(v[0] - midwh, v[1], v[0] + midwh, v[1]);
            const by = Math.ceil(v[1] - componentHeight / 2);
            const byh_0 = by + componentHeight2;
            const byh_1 = by + hpair;
            grad2_0.addColorStop(0, scaleColorBy(basecolor, lightness0_edge));
            grad2_0.addColorStop(0.5, scaleColorBy(basecolor, lightness0_mid));
            grad2_0.addColorStop(1, scaleColorBy(basecolor, lightness0_edge));
            grad2_1.addColorStop(0, scaleColorBy(basecolor, lightness1_edge));
            grad2_1.addColorStop(0.5, scaleColorBy(basecolor, 1));
            grad2_1.addColorStop(1, scaleColorBy(basecolor, lightness1_edge));
            cx.fillStyle = grad2_0;
            cx.beginPath();
            cx.moveTo(v[0] - nw / 2, by);
            cx.lineTo(v[0] + nw / 2, by);
            cx.lineTo(v[0] + componentWidth / 2, by + componentHeight);
            cx.lineTo(v[0] - componentWidth / 2, by + componentHeight);
            cx.fill();
            cx.fillStyle = grad2_1;
            for (let i = 0; i < count; i++) {
                const lyr_0 = i * hpair + componentHeight2;
                const lyr_1 = (i + 1) * hpair;
                const ly = [byh_0 + i * hpair, byh_1 + i * hpair];
                const lw = [
                    (nw + (componentWidth - nw) * (lyr_0 / componentHeight)) / 2,
                    (nw + (componentWidth - nw) * (lyr_1 / componentHeight)) / 2,
                ];
                cx.beginPath();
                cx.moveTo(v[0] - lw[0], ly[0]);
                cx.lineTo(v[0] + lw[0], ly[0]);
                cx.lineTo(v[0] + lw[1], ly[1]);
                cx.lineTo(v[0] - lw[1], ly[1]);
                cx.fill();
            }
        },
        //Elongated cylinder (calls component 0 - 2 on top of its starting point)
        function (v) {
            const cn = centerness(v, false);
            const lightmid = shipRandomizer.sd(0.7, 1);
            const lightedge = shipRandomizer.sd(0, 0.2);
            const baseColor = computeBaseColor();
            const colormid = scaleColorBy(baseColor, lightmid);
            const coloredge = scaleColorBy(baseColor, lightedge);
            const componentWidth = Math.max(3, Math.ceil(size *
                shipRandomizer.sd(0.4, 1) ** 2 *
                factionRandomizer.hd(0.02, 0.1, 48 /* Component4MaxWidth */)));
            const hwi = Math.floor(componentWidth / 2);
            const hwe = componentWidth % 2;
            const forwards = factionRandomizer.hd(0, 1, 43 /* Component4DirectionC0 */) ** 4;
            const backwards = 0.1 * factionRandomizer.hd(0, 1, 44 /* Component4DirectionC1 */) ** 4;
            const toCenter = 0.2 * factionRandomizer.hd(0, 1, 45 /* Component4DirectionC2 */) ** 4;
            const direction = shipRandomizer.schoose([
                forwards * (2 - cn),
                backwards,
                toCenter * (1 + cn),
            ]);
            let ev;
            // Shorter than comparing with 0
            if (!direction) {
                //forwards
                const hlimit = v[1];
                const componentHeight = Math.min(Math.max(COMPONENT_MAXIMUM_SIZE, hlimit - shipRandomizer.si(0, COMPONENT_MAXIMUM_SIZE * 2)), Math.floor(0.7 *
                    size *
                    shipRandomizer.sd(0, 1) **
                        factionRandomizer.hd(2, 6, 46 /* Component4HPower0 */)));
                const bb_0_0 = v[0] - hwi, bb_0_1 = v[1] - componentHeight, bb_1_0 = v[0] + hwi + hwe;
                const grad = cx.createLinearGradient(bb_0_0, bb_0_1, bb_1_0, bb_0_1);
                grad.addColorStop(0, coloredge);
                grad.addColorStop(0.5, colormid);
                grad.addColorStop(1, coloredge);
                cx.fillStyle = grad;
                cx.fillRect(bb_0_0, bb_0_1, componentWidth, componentHeight);
                ev = [v[0], v[1] - componentHeight];
            }
            else if (direction < 2) {
                //backwards
                const hlimit = h - v[1];
                const componentHeight = Math.min(Math.max(COMPONENT_MAXIMUM_SIZE, hlimit - shipRandomizer.si(0, COMPONENT_MAXIMUM_SIZE * 2)), Math.floor(0.6 *
                    size *
                    shipRandomizer.sd(0, 1) **
                        factionRandomizer.hd(2, 7, 47 /* Component4HPower1 */)));
                const bb_0_0 = v[0] - hwi, bb_0_1 = v[1], bb_1_0 = v[0] + hwi + hwe;
                const grad = cx.createLinearGradient(bb_0_0, bb_0_1, bb_1_0, bb_0_1);
                grad.addColorStop(0, coloredge);
                grad.addColorStop(0.5, colormid);
                grad.addColorStop(1, coloredge);
                cx.fillStyle = grad;
                cx.fillRect(bb_0_0, bb_0_1, componentWidth, componentHeight);
                ev = [v[0], v[1] + componentHeight];
            }
            else {
                // to center
                const grad = cx.createLinearGradient(v[0], v[1] - hwi, v[0], v[1] + hwi + hwe);
                grad.addColorStop(0, coloredge);
                grad.addColorStop(0.5, colormid);
                grad.addColorStop(1, coloredge);
                cx.fillStyle = grad;
                cx.fillRect(v[0], v[1] - hwi, Math.ceil(hw - v[0]) + 1, componentWidth);
                ev = [hw, v[1]];
            }
            const coverComC = [
                0.6 * factionRandomizer.hd(0, 1, 40 /* Component4CoverComC0 */) ** 2,
                0.2 * factionRandomizer.hd(0, 1, 41 /* Component4CoverComC1 */) ** 2,
                factionRandomizer.hd(0, 1, 42 /* Component4CoverComC2 */) ** 2,
            ];
            components[shipRandomizer.schoose(coverComC)](v);
            if (isCellGood(ev[0], ev[1])) {
                const nev = [
                    ev[0] + Math.round(shipRandomizer.sd(-1, 1) * COMPONENT_GRID_SIZE),
                    ev[1] + Math.round(shipRandomizer.sd(-1, 1) * COMPONENT_GRID_SIZE),
                ];
                components[shipRandomizer.schoose(coverComC)](isCellGood(nev[0], nev[1]) ? nev : ev);
            }
        },
        //Ball
        function (v) {
            const lcms = calculateLcms(5, v, 0.1, 0, 0.9, 0, 0.8);
            const lightmid = shipRandomizer.sd(0.75, 1);
            const lightedge = shipRandomizer.sd(0, 0.25);
            const baseColor = computeBaseColor();
            const colormid = scaleColorBy(baseColor, lightmid);
            const coloredge = scaleColorBy(baseColor, lightedge);
            const countx = 1 +
                shipRandomizer.sseq(factionRandomizer.hd(0, 1, 50 /* Component5MultXC */), Math.floor(1.2 * (lcms / COMPONENT_MAXIMUM_SIZE) ** 0.6));
            const county = 1 +
                shipRandomizer.sseq(factionRandomizer.hd(0, 1, 51 /* Component5MultYC */), Math.floor(1.2 * (lcms / COMPONENT_MAXIMUM_SIZE) ** 0.6));
            const smallr = (shipRandomizer.sd(0.5, 1) * lcms) / Math.max(countx, county);
            const drawr = smallr + 0.5;
            const bv = [v[0] - smallr * countx, v[1] - smallr * county];
            cx.fillStyle = `rgba(0,0,0,${shipRandomizer.sd(0, 0.2)})`;
            for (let ax = 0; ax < countx; ax++) {
                const px = bv[0] + (ax * 2 + 1) * smallr;
                for (let ay = 0; ay < county; ay++) {
                    const py = bv[1] + (ay * 2 + 1) * smallr;
                    cx.beginPath();
                    cx.arc(px, py, smallr + 1, 0, 7);
                    cx.fill();
                }
            }
            for (let ax = 0; ax < countx; ax++) {
                const px = bv[0] + (ax * 2 + 1) * smallr;
                for (let ay = 0; ay < county; ay++) {
                    const py = bv[1] + (ay * 2 + 1) * smallr;
                    const grad = cx.createRadialGradient(px, py, smallr / 5, px, py, drawr);
                    grad.addColorStop(0, colormid);
                    grad.addColorStop(1, coloredge);
                    cx.fillStyle = grad;
                    cx.beginPath();
                    cx.arc(px, py, drawr, 0, 7);
                    cx.fill();
                }
            }
        },
        //Forward-facing trapezoidal fin
        function (v) {
            if (nextpass <= 0 || shipRandomizer.sb(frontness(v))) {
                components[shipRandomizer.schoose(componentChances.slice(0, 6))](v);
                return;
            }
            const lcms = calculateLcms(6, v, 0.05, 0, 0.9, 0, 0.8);
            const h0 = Math.ceil(lcms * 2 * shipRandomizer.sd(0.6, 1)); //Inner height, longer.
            const hh0i = Math.floor(h0 / 2);
            const hh0e = h0 % 2;
            //Outer height, shorter
            const h1 = h0 *
                shipRandomizer.sd(factionRandomizer.hd(0, 0.8, 60 /* Component6H1Min */) ** 0.5, 0.9) **
                    factionRandomizer.hd(0.5, 1.5, 61 /* Component6H1Power */);
            const hh1i = Math.floor(h1 / 2);
            const backamount = Math.max((h1 - h0) / 2, h0 *
                (shipRandomizer.sd(0, 0.45) + shipRandomizer.sd(0, 0.45)) *
                (factionRandomizer.hb(0.8, 62 /* Component6BacknessType */)
                    ? factionRandomizer.hd(0.2, 0.9, 63 /* Component6BacknessPositive */)
                    : factionRandomizer.hd(-0.2, -0.05, 64 /* Component6BacknessNegative */)));
            const componentWidth = Math.ceil(lcms *
                shipRandomizer.sd(0.7, 1) *
                factionRandomizer.hd(0.1, 3.5, 65 /* Component6Width */) ** 0.5);
            const hwi = Math.floor(componentWidth / 2);
            const hwe = componentWidth % 2;
            const quad = [
                [v[0] - hwi, v[1] + backamount - hh1i],
                [v[0] + hwi + hwe, v[1] - hh0i],
                [v[0] + hwi + hwe, v[1] + hh0i + hh0e],
                [v[0] - hwi, v[1] + backamount + hh1i + h0 % 2],
            ];
            const baseColor = computeBaseColor();
            cx.fillStyle = `rgba(0,0,0,${shipRandomizer.sd(0, 0.2)})`;
            cx.beginPath();
            cx.moveTo(quad[0][0] - 1, quad[0][1]);
            cx.lineTo(quad[1][0] - 1, quad[1][1]);
            cx.lineTo(quad[2][0] - 1, quad[2][1]);
            cx.lineTo(quad[3][0] - 1, quad[3][1]);
            cx.fill();
            cx.fillStyle = scaleColorBy(baseColor, shipRandomizer.sd(0.7, 1));
            cx.beginPath();
            cx.moveTo(quad[0][0], quad[0][1]);
            cx.lineTo(quad[1][0], quad[1][1]);
            cx.lineTo(quad[2][0], quad[2][1]);
            cx.lineTo(quad[3][0], quad[3][1]);
            cx.fill();
        },
    ];
    // ------ End define components -----------------------------------
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
            if (nv[0] < 0 ||
                nv[0] > w ||
                nv[1] < 0 ||
                nv[1] > h ||
                !getOutlineAlpha(nv[0], nv[1])) {
                continue;
            }
            lv = nv;
            break;
        }
        if (Math.abs(lv[0] - hw) < COMPONENT_GRID_SIZE &&
            shipRandomizer.sb(factionRandomizer.hd(0, 1, 70 /* ComponentMiddleness */))) {
            lv[0] = hw;
        }
        components[shipRandomizer.schoose(componentChances)](lv);
        totaldone++;
    }
    // The generated ship is asymmetric, so we fix it here
    // Removing this makes the vast majority of ships look quite a bit worse
    cx.clearRect(hw + (w % 2), 0, w, h);
    cx.scale(-1, 1);
    cx.drawImage(shipCanvas, -w, 0);
    return shipCanvas;
}
