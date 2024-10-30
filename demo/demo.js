/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./node_modules/game-utils/lib/index.js
function getContext(canvas) {
    // @ts-expect-error -- Could potentially return null, but we won't account for that case
    return canvas.getContext("2d");
}
function createCanvas(width, height) {
    const newCanvas = document.createElement("canvas");
    newCanvas.width = width;
    newCanvas.height = height;
    return [newCanvas, getContext(newCanvas)];
}
function fillCircle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 7);
    ctx.fill();
}
function obtainImageData(canvas) {
    return getContext(canvas).getImageData(0, 0, canvas.width, canvas.height);
}
function obtainPixelArray(canvas) {
    return obtainImageData(canvas).data;
}
function trimCanvas(canvas) {
    const ctx = getContext(canvas);
    const imageData = obtainImageData(canvas);
    const xs = [];
    const ys = [];
    for (let x = 0; x < imageData.width; x++) {
        for (let y = 0; y < imageData.height; y++) {
            if (imageData.data[(y * imageData.width + x) * 4 + 3]) {
                xs.push(x);
                ys.push(y);
            }
        }
    }
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const cut = ctx.getImageData(minX, minY, 1 + Math.max(...xs) - minX, 1 + Math.max(...ys) - minY);
    canvas.width = cut.width;
    canvas.height = cut.height;
    ctx.putImageData(cut, 0, 0);
    return canvas;
}
function createPRNGGenerator(seed) {
    const ints = new Uint32Array([
        Math.imul(seed, 0x85ebca6b),
        Math.imul(seed, 0xc2b2ae35),
    ]);
    return () => {
        const s0 = ints[0];
        const s1 = ints[1] ^ s0;
        ints[0] = ((s0 << 26) | (s0 >> 8)) ^ s1 ^ (s1 << 9);
        ints[1] = (s1 << 13) | (s1 >> 19);
        return (Math.imul(s0, 0x9e3779bb) >>> 0) / 0xffffffff;
    };
}
// Converts a number between 0 and 1 to a number between [a, b)
function numberBetween(target, a, b) {
    return target * (b - a) + a;
}
// Converts a number between 0 and 1 to an integer number between [a,b] (both included)
function integerNumberBetween(target, a, b) {
    return Math.floor(numberBetween(target, a, b + 1));
}
function createCanvasFragments(targetCanvas, rng, desiredSize) {
    const COLLECTOR_MIN_X = 0;
    const COLLECTOR_MIN_Y = 1;
    const COLLECTOR_MAX_X = 2;
    const COLLECTOR_MAX_Y = 3;
    const COLLECTOR_CENTER_X = 4;
    const COLLECTOR_CENTER_Y = 5;
    const COLLECTOR_NEAREST = 6;
    const width = targetCanvas.width;
    const height = targetCanvas.height;
    const targetSize = desiredSize || Math.max(12, Math.floor(Math.min(width, height) / 12));
    const pixelArray = obtainPixelArray(targetCanvas);
    const xPoints = Math.floor(width / targetSize);
    const yPoints = Math.floor(height / targetSize);
    const collectors = [];
    const yOffset = Math.floor(height / yPoints / 2);
    const sprites = [];
    // Gather collectors
    for (let currentY = 0; currentY < yPoints; currentY++) {
        // We calculate the initial offset so the center points are in a displaced pattern
        const xOffset = Math.floor(width / ((2 - (currentY % 2)) * xPoints));
        for (let currentX = 0; currentX < xPoints - (currentY % 2); currentX++) {
            // We add some noise so all pieces look different
            collectors.push([
                1e9,
                1e9,
                0,
                0,
                xOffset + ((currentX + (rng() - 0.5)) * width) / xPoints,
                yOffset + ((currentY + (rng() - 0.5)) * height) / yPoints,
                [],
            ]);
        }
    }
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pos = (y * width + x) * 4;
            if (pixelArray[pos + 3]) {
                // Non transparent pixel
                // With the size of the images we are working, 1,000,000,000 behaves the same as infinity
                let minDistance = 1e9;
                let minCollector;
                collectors.map((c) => {
                    const distance = Math.hypot(c[COLLECTOR_CENTER_X] - x, c[COLLECTOR_CENTER_Y] - y);
                    if (distance < minDistance) {
                        minDistance = distance;
                        minCollector = c;
                    }
                });
                minCollector[COLLECTOR_MIN_X] = Math.min(x, minCollector[COLLECTOR_MIN_X]);
                minCollector[COLLECTOR_MAX_X] = Math.max(x, minCollector[COLLECTOR_MAX_X]);
                minCollector[COLLECTOR_MIN_Y] = Math.min(y, minCollector[COLLECTOR_MIN_Y]);
                minCollector[COLLECTOR_MAX_Y] = Math.max(y, minCollector[COLLECTOR_MAX_Y]);
                minCollector[COLLECTOR_NEAREST].push([
                    x,
                    y,
                    pixelArray.slice(pos, pos + 4),
                ]);
            }
        }
    }
    // We want to have the collectors with the most points first
    // sort modifies in place, so collectors changes as a side effect (which we don't really care because we don't use it anymore)
    collectors
        .sort((a, b) => b[COLLECTOR_NEAREST].length - a[COLLECTOR_NEAREST].length)
        .map((collector) => {
        if (collector[COLLECTOR_MIN_X] < 1e9) {
            const shardWidth = collector[COLLECTOR_MAX_X] - collector[COLLECTOR_MIN_X] + 1;
            const shardHeight = collector[COLLECTOR_MAX_Y] - collector[COLLECTOR_MIN_Y] + 1;
            const [shardCanvas, shardCtx] = createCanvas(shardWidth, shardHeight);
            const imgData = obtainImageData(shardCanvas);
            collector[COLLECTOR_NEAREST].map((point) => imgData.data.set(point[2], 4 *
                ((point[1] - collector[COLLECTOR_MIN_Y]) * shardWidth +
                    (point[0] - collector[COLLECTOR_MIN_X]))));
            shardCtx.putImageData(imgData, 0, 0);
            sprites.push([
                shardCanvas,
                collector[COLLECTOR_MIN_X],
                collector[COLLECTOR_MIN_Y],
            ]);
        }
    });
    return sprites;
}

;// ./src/outline/voronoi.ts

function voronoi_generateOutline(layoutSeed, forceSize) {
    const layoutRNG = createPRNGGenerator(layoutSeed);
    const size = forceSize || integerNumberBetween(layoutRNG(), 2.5, 7) ** 3;
    const [shipOutline, shipOutlineContext] = createCanvas(size, size);
    const [piecesCanvas, piecesCanvasContext] = createCanvas(size, size);
    piecesCanvasContext.fillStyle = "red";
    piecesCanvasContext.fillRect(0, 0, size, size);
    const sprites = createCanvasFragments(piecesCanvas, layoutRNG, size / numberBetween(layoutRNG(), 3, 6));
    for (let i = sprites.length; i--;) {
        const [spriteCanvas, left, top] = sprites[i];
        if (left > 0 &&
            top > 0 &&
            left + spriteCanvas.width < size &&
            top + spriteCanvas.height < size) {
            shipOutlineContext.drawImage(spriteCanvas, left, top);
        }
    }
    return shipOutline;
}

;// ./src/utils.ts
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
// Take a color and multiplies it with a factor. factor = 0 produces black.
function scaleColorBy(color, factor) {
    return `rgb(${color.map((channel) => channel * factor * 100).join("%,")}%)`;
}
// Takes a triplet [H,S,V] and returns a triplet [R,G,B], representing the same color. All components are 0 - 1.
function hsvToRgb(h, s, v) {
    const f = (n, k = (n + h * 6) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)];
}
function sequenceAdvancer(generator, chance, max) {
    let rv = 0;
    while (generator() < chance && rv < max) {
        rv++;
    }
    return rv;
}
function chancePicker(generator, chances) {
    let sum = 0;
    for (let i = 0; i < chances.length; i++) {
        sum += chances[i];
    }
    let which = generator() * sum;
    for (let i = 0; i < chances.length; i++) {
        which -= chances[i];
        if (which <= 0) {
            return i;
        }
    }
    // We know we already returned at this point
}

;// ./src/outline/classic.ts


//Size of the component grid
const COMPONENT_GRID_SIZE = 6;
function classic_generateOutline(layoutSeed, forceSize) {
    const layoutRNG = createPRNGGenerator(layoutSeed);
    const layoutOutlineType = integerNumberBetween(layoutRNG(), 0, 2);
    const size = forceSize || numberBetween(layoutRNG(), 2.5, 7) ** 3;
    const wratio = numberBetween(layoutRNG(), 0.5, 1.3);
    const hratio = numberBetween(layoutRNG(), 0.7, 1.7);
    const layoutOutline0InitialWidth = numberBetween(layoutRNG(), 0.1, 1);
    const layoutOutline0BlockCount = numberBetween(layoutRNG(), 2, 8);
    const layoutOutline0FrontBias = numberBetween(layoutRNG(), 0.5, 1.5);
    const layoutOutline1InitialWidth = numberBetween(layoutRNG(), 0.1, 1);
    const layoutOutline1CircleCount = numberBetween(layoutRNG(), 10, 50);
    const layoutOutline1FrontBias = numberBetween(layoutRNG(), 0.5, 1.5);
    const layoutOutline2BaseFatness = numberBetween(layoutRNG(), 0.03, 0.1);
    const layoutOutline2FrontBias = numberBetween(layoutRNG(), 0.1, 1);
    const layoutOutline2ConAdjust = layoutRNG();
    const aliasedCircle = (xc, yc, r) => {
        let x = r = Math.round(r), y = 0, cd = 0;
        xc = Math.round(xc);
        yc = Math.round(yc);
        // middle line
        cx.fillRect(xc - x, yc, 2 * r, 1);
        for (; x-- > y++;) {
            cd -= x - y;
            if (cd < 0)
                cd += x++;
            cx.fillRect(xc - y, yc - x, 2 * y, 1); // upper 1/4
            cx.fillRect(xc - x, yc - y, 2 * x, 1); // upper 2/4
            cx.fillRect(xc - x, yc + y, 2 * x, 1); // lower 3/4
            cx.fillRect(xc - y, yc + x, 2 * y, 1); // lower 4/4
        }
    };
    const aliasedLine = (x1, y1, x2, y2, thickness) => {
        // Define differences and error check
        thickness = Math.round(thickness / 2);
        x1 = Math.round(x1);
        y1 = Math.round(y1);
        x2 = Math.round(x2);
        y2 = Math.round(y2);
        let dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1), sx = (x1 < x2) ? 1 : -1, sy = (y1 < y2) ? 1 : -1, err = dx - dy;
        // Set first coordinates
        aliasedCircle(x1, y1, thickness);
        // Main loop
        for (; (!((x1 == x2) && (y1 == y2)));) {
            var e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
            // Set coordinates
            aliasedCircle(x1, y1, thickness);
        }
    };
    const w = Math.floor(size * wratio); // Maximum width of this ship, in pixels
    const h = Math.floor(size * hratio); // Maximum height of this ship, in pixels
    const hw = Math.floor(w / 2);
    const [shipOutline, cx] = createCanvas(w, h); // Canvas on which the basic outline of the ship is drawn. Ships face upwards, with front towards Y=0
    const csarealimit = (w * h) / 20;
    cx.fillStyle = "red";
    // ------ Define outlines ---------------------------------------
    if (layoutOutlineType == 0) {
        // 0: Joined rectangles.
        const initialWidth = Math.ceil((w * layoutOutline0InitialWidth) / 5);
        const blocks = [
            [
                [hw - initialWidth, 0],
                [hw + initialWidth, h],
            ],
        ];
        const blockcount = 2 +
            Math.floor(numberBetween(layoutRNG(), 0.5, 1) *
                layoutOutline0BlockCount *
                size ** 0.5);
        for (let i = 1; i < blockcount; i++) {
            const base = blocks[integerNumberBetween(layoutRNG(), 0, blocks.length - 1)];
            const v0 = [
                base[0][0] + layoutRNG() * (base[1][0] - base[0][0]),
                base[0][1] + layoutRNG() * (base[1][1] - base[0][1]),
            ];
            if (v0[1] < (base[0][1] + base[1][1]) / 2 &&
                layoutRNG() < layoutOutline0FrontBias) {
                v0[1] = base[1][1] - (v0[1] - base[0][1]);
            }
            const v1 = [layoutRNG() * w, layoutRNG() * h];
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
        blocks.map((lb) => {
            cx.fillRect(lb[0][0], lb[0][1], lb[1][0] - lb[0][0], lb[1][1] - lb[0][1]);
            cx.fillRect(w - lb[1][0], lb[0][1], lb[1][0] - lb[0][0], lb[1][1] - lb[0][1]);
        });
    }
    else if (layoutOutlineType == 1) {
        const csrlimit = Math.max(2, (csarealimit / Math.PI) ** 0.5);
        const initialwidth = Math.ceil((w * layoutOutline1InitialWidth) / 5);
        const circles = [];
        const initialcount = Math.floor(h / (initialwidth * 2));
        for (let i = 0; i < initialcount; i++) {
            circles.push([hw, h - initialwidth * (i * 2 + 1), initialwidth]);
        }
        const circlecount = initialcount +
            Math.floor(numberBetween(layoutRNG(), 0.5, 1) *
                layoutOutline1CircleCount *
                size ** 0.5);
        for (let i = initialcount; i < circlecount; i++) {
            const base = circles[Math.max(integerNumberBetween(layoutRNG(), 0, circles.length - 1), integerNumberBetween(layoutRNG(), 0, circles.length - 1))];
            let ncr = numberBetween(layoutRNG(), 1, csrlimit);
            const pr = numberBetween(layoutRNG(), Math.max(0, base[2] - ncr), base[2]);
            let pa = numberBetween(layoutRNG(), 0, 2 * Math.PI);
            if (pa > Math.PI && layoutRNG() < layoutOutline1FrontBias) {
                pa = numberBetween(layoutRNG(), 0, Math.PI);
            }
            let lv0 = base[0] + Math.cos(pa) * pr, lv1 = base[1] + Math.sin(pa) * pr;
            ncr = Math.min(ncr, lv0, w - lv0, lv1, h - lv1);
            circles.push([lv0, lv1, ncr]);
        }
        circles.map(([x, y, r]) => {
            aliasedCircle(x, y, r);
            aliasedCircle(w - x, y, r);
        });
    }
    else {
        // 2: Mess of lines
        const points = [
            [hw, numberBetween(layoutRNG(), 0, 0.05) * h],
            [hw, numberBetween(layoutRNG(), 0.95, 1) * h],
        ];
        const basefatness = COMPONENT_GRID_SIZE / size + layoutOutline2BaseFatness;
        const pointcount = Math.max(3, Math.ceil((numberBetween(layoutRNG(), 0.05, 0.1) / basefatness) * size ** 0.5));
        for (let npi = 1; npi < pointcount; npi++) {
            let np = points[npi];
            if (!np) {
                np = [layoutRNG() * w, layoutRNG() ** layoutOutline2FrontBias * h];
                points.push(np);
            }
            const cons = 1 + sequenceAdvancer(layoutRNG, layoutOutline2ConAdjust, 3);
            for (let nci = 0; nci < cons; nci++) {
                const pre = points[integerNumberBetween(layoutRNG(), 0, points.length - 2)];
                const lineWidth = numberBetween(layoutRNG(), 0.7, 1) * basefatness * size;
                aliasedLine(pre[0], pre[1], np[0], np[1], lineWidth);
                aliasedLine(w - pre[0], pre[1], w - np[0], np[1], lineWidth);
            }
        }
    }
    return shipOutline;
}

;// ./src/outline/micro.ts
//r=r=>Math.random()*r
//for(i=9;i--;x.rect(44-w+t%1*5e3,50+(t|0)*132-h+r(60),2*w,2*h))w=r(32),h=r(32)
//x.fill`evenodd`

function micro_generateOutline(layoutSeed, forceSize) {
    const layoutRNG = createPRNGGenerator(layoutSeed);
    const size = forceSize || numberBetween(layoutRNG(), 2.5, 7) ** 3;
    const halfSize = Math.floor(size / 2);
    const [shipOutline, cx] = createCanvas(size, 3 * size); // Canvas on which the basic outline of the ship is drawn. Ships face upwards, with front towards Y=0
    cx.fillStyle = "red";
    for (let i = integerNumberBetween(layoutRNG(), 1, size / 10); i--;) {
        const rectWidth = integerNumberBetween(layoutRNG(), 1, halfSize);
        const rectHeight = integerNumberBetween(layoutRNG(), 1, halfSize);
        cx.rect(halfSize - rectWidth, halfSize - rectHeight + integerNumberBetween(layoutRNG(), 1, size * 2), 2 * rectWidth, 2 * rectHeight);
    }
    cx.fill(layoutRNG() < 0.5 ? 'evenodd' : undefined);
    return shipOutline;
}

;// ./src/ship.ts


//Size of the component grid
const ship_COMPONENT_GRID_SIZE = 6;
//Base maximum extent of a component from its origin point. Should be at least equal to cgridsize, but no greater than csedge.
const COMPONENT_MAXIMUM_SIZE = 8;
const CELL_GX = 0;
const CELL_GY = 1;
const CELL_X = 2;
const CELL_Y = 3;
const CELL_PHASE = 4;
// This library is heavily optimized towards size, as I used it for a JS13K game. Also, I'm planning to use
// it again for that purpose in the future. This function is a lot bigger than it needs to be, but doing so
// allows us to have all variables we need in the closure instead of passing it around in parameters
function generateShip(shipOutline, colorSeed, shipSeed) {
    const w = shipOutline.width;
    const h = shipOutline.height;
    const [shipCanvas, cx] = createCanvas(w, h); // Canvas on which the basic outline of the ship is drawn. Ships face upwards, with front towards Y=0
    const outline = obtainPixelArray(shipOutline);
    const hw = Math.floor(w / 2);
    const gw = Math.floor(w / ship_COMPONENT_GRID_SIZE);
    const gwextra = (w - gw * ship_COMPONENT_GRID_SIZE) / 2;
    const hh = Math.floor(h / 2);
    const gh = Math.floor(h / ship_COMPONENT_GRID_SIZE);
    const ghextra = (h - gh * ship_COMPONENT_GRID_SIZE) / 2;
    const colorRNG = createPRNGGenerator(colorSeed);
    const shipRNG = createPRNGGenerator(shipSeed);
    // Default maximum power
    const componentChancePower = 8;
    const componentChances = [
        0.8 *
            numberBetween(shipRNG(), 0.001, 1) *
            2 ** (shipRNG() * componentChancePower),
        0.9 *
            numberBetween(shipRNG(), 0.001, 1) *
            2 ** (shipRNG() * componentChancePower),
        1 *
            numberBetween(shipRNG(), 0.001, 1) *
            2 ** (shipRNG() * componentChancePower),
        3 * shipRNG() * 2 ** (shipRNG() * componentChancePower),
        0.5 * shipRNG() * 2 ** (shipRNG() * componentChancePower),
        0.05 * shipRNG() * 2 ** (shipRNG() * componentChancePower),
        0.5 * shipRNG() * 2 ** (shipRNG() * componentChancePower),
    ];
    const colors = [];
    const colorChances = [];
    const colorCount = 1 + (colorRNG() < 0.7 ? 1 : 0) + sequenceAdvancer(colorRNG, 0.3, 3);
    // Compute faction colors
    for (let i = 0; i < colorCount; i++) {
        // Just doing random RGB coloring should be alright and simplify the code
        colors.push(hsvToRgb(colorRNG() ** 2, clamp(numberBetween(colorRNG(), -0.2, 1), 0, colorRNG() ** 4), Math.max(numberBetween(colorRNG(), 0.7, 1.1), 1)));
        // Default maximum power is 6
        colorChances.push(2 ** (colorRNG() * 6));
    }
    const baseColorShiftChance = colorRNG() / 2;
    const baseColorShiftChanceRed = numberBetween(colorRNG(), 0, 0.6);
    const baseColorShiftChanceGreen = numberBetween(colorRNG(), 0, 0.6);
    const baseColorShiftChanceBlue = numberBetween(colorRNG(), 0, 0.6);
    const factionBaseComponentPasses = integerNumberBetween(shipRNG(), 1, 2);
    const factionExtraComponentAmount = shipRNG() / factionBaseComponentPasses;
    const factionMasterBigness = shipRNG();
    const factionComponentMiddleness = shipRNG();
    const factionComponent1HChance = numberBetween(shipRNG(), -0.2, 1.2);
    const factionComponent2OddChance = shipRNG();
    const factionComponent2VerticalChance = shipRNG();
    const factionComponent3Lightness0Mid = numberBetween(shipRNG(), 0.5, 0.8);
    const factionComponent3Lightness0Edge = factionComponent3Lightness0Mid - numberBetween(shipRNG(), 0.2, 0.4);
    const factionComponent3Lightness1Edge = numberBetween(shipRNG(), 0, 0.2);
    const factionComponent3BaseColor = chancePicker(shipRNG, colorChances);
    const factionComponent4MaxWidth = numberBetween(shipRNG(), 0.02, 0.1);
    const factionComponent4DirectionC0 = shipRNG();
    const factionComponent4DirectionC1 = shipRNG();
    const factionComponent4DirectionC2 = shipRNG();
    const factionComponent4HPower0 = numberBetween(shipRNG(), 2, 6);
    const factionComponent4HPower1 = numberBetween(shipRNG(), 2, 7);
    const factionComponent4CoverComC0 = shipRNG();
    const factionComponent4CoverComC1 = shipRNG();
    const factionComponent4CoverComC2 = shipRNG();
    const factionComponent5MultXC = shipRNG();
    const factionComponent5MultYC = shipRNG();
    const factionComponent6H1Min = numberBetween(shipRNG(), 0, 0.8);
    const factionComponent6H1Power = numberBetween(shipRNG(), 0.5, 1.5);
    const factionComponent6BacknessType = shipRNG();
    const factionComponent6BacknessPositive = numberBetween(shipRNG(), 0.2, 0.9);
    const factionComponent6BacknessNegative = numberBetween(shipRNG(), -0.2, -0.05);
    const factionComponent6Width = numberBetween(shipRNG(), 0.1, 3.5);
    const factionComponentBigChances = componentChances.map(shipRNG);
    const factionComponentBigIncChances = componentChances.map(shipRNG);
    const computeBaseColor = () => {
        let rv = colors[chancePicker(colorRNG, colorChances)];
        return colorRNG() < baseColorShiftChance ** 2
            ? [
                clamp(rv[0] +
                    baseColorShiftChanceRed ** 2 *
                        clamp(numberBetween(colorRNG(), -1, 1.2), 0, 1) *
                        clamp((colorRNG() < 0.7 ? -1 : 1) + (colorRNG() < 0.7 ? -1 : 1), -1, 1), 0, 1),
                clamp(rv[1] +
                    baseColorShiftChanceGreen ** 2 *
                        clamp(numberBetween(colorRNG(), -1, 1.2), 0, 1) *
                        clamp((colorRNG() < 0.7 ? -1 : 1) + (colorRNG() < 0.7 ? -1 : 1), -1, 1), 0, 1),
                clamp(rv[2] +
                    baseColorShiftChanceBlue ** 2 *
                        clamp(numberBetween(colorRNG(), -1, 1.2), 0, 1) *
                        clamp((colorRNG() < 0.7 ? -1 : 1) + (colorRNG() < 0.7 ? -1 : 1), -1, 1), 0, 1),
            ]
            : rv;
    };
    const gradientInOut = (x0, y0, x1, y1, inColor, outColor) => {
        const grad = cx.createLinearGradient(x0, y0, x1, y1);
        grad.addColorStop(0, inColor);
        grad.addColorStop(0.5, outColor);
        grad.addColorStop(1, inColor);
        return grad;
    };
    //Returns the alpha value (0 - 255) for the pixel of csd corresponding to the point (X,Y)
    const isOutlineFilled = (x, y) => outline[(y * w + x) * 4];
    const cgrid = [];
    for (let gx = 0; gx < gw; gx++) {
        cgrid[gx] = [];
        for (let gy = 0; gy < gh; gy++) {
            cgrid[gx][gy] = [
                gx,
                gy,
                Math.floor(gwextra + (gx + 0.5) * ship_COMPONENT_GRID_SIZE),
                Math.floor(ghextra + (gy + 0.5) * ship_COMPONENT_GRID_SIZE),
            ]; // Phase is 0 for unchecked, 1 for checked and good, and -1 for checked and bad
        }
    }
    const goodcells = [cgrid[Math.floor(gw / 2)][Math.floor(gh / 2)]];
    for (let nextcheck = 0; nextcheck < goodcells.length; nextcheck++) {
        const lcell = goodcells[nextcheck];
        if (lcell[CELL_GX] > 0) {
            const ncell = cgrid[lcell[CELL_GX] - 1][lcell[CELL_GY]];
            if (!ncell[CELL_PHASE]) {
                if (isOutlineFilled(ncell[CELL_X], ncell[CELL_Y])) {
                    ncell[CELL_PHASE] = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell[CELL_PHASE] = 2;
                }
            }
        }
        if (lcell[CELL_GX] < gw - 1) {
            const ncell = cgrid[lcell[CELL_GX] + 1][lcell[CELL_GY]];
            if (!ncell[CELL_PHASE]) {
                if (isOutlineFilled(ncell[CELL_X], ncell[CELL_Y])) {
                    ncell[CELL_PHASE] = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell[CELL_PHASE] = 2;
                }
            }
        }
        if (lcell[CELL_GY] > 0) {
            const ncell = cgrid[lcell[CELL_GX]][lcell[CELL_GY] - 1];
            if (!ncell[CELL_PHASE]) {
                if (isOutlineFilled(ncell[CELL_X], ncell[CELL_Y])) {
                    ncell[CELL_PHASE] = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell[CELL_PHASE] = 2;
                }
            }
        }
        if (lcell[CELL_GY] < gh - 1) {
            const ncell = cgrid[lcell[CELL_GX]][lcell[CELL_GY] + 1];
            if (!ncell[CELL_PHASE]) {
                if (isOutlineFilled(ncell[CELL_X], ncell[CELL_Y])) {
                    ncell[CELL_PHASE] = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell[CELL_PHASE] = 2;
                }
            }
        }
    }
    for (let i = 0; i < goodcells.length; i++) {
        const lcell = goodcells[i];
        const ocell = cgrid[gw - 1 - lcell[CELL_GX]][lcell[CELL_GY]];
        if (ocell[CELL_PHASE] - 1) {
            ocell[CELL_PHASE] = 1;
            goodcells.push(ocell);
        }
    }
    const extra = Math.max(1, Math.floor(goodcells.length * factionExtraComponentAmount));
    const totalcomponents = factionBaseComponentPasses * goodcells.length + extra;
    // Touching the dimensions of the canvas will reset its data
    shipCanvas.width |= 0;
    // ------ Define components ---------------------------------------
    //Returns true if the cell at (X,Y) is good, or false if there is no such cell
    function isCellGood(x, y) {
        const gx = Math.floor((x - gwextra) / ship_COMPONENT_GRID_SIZE);
        const gy = Math.floor((y - ghextra) / ship_COMPONENT_GRID_SIZE);
        if (gx < 0 || gx >= gw || gy < 0 || gy >= gh) {
            return;
        }
        return cgrid[gx][gy][CELL_PHASE] == 1;
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
        const effectFaction = factionMasterBigness ** 0.5;
        const effectStack = 1 - totaldone / totalcomponents;
        const bn = (effectCenter * effectShipsize * effectFaction * effectStack) **
            magnitude;
        let lcms = COMPONENT_MAXIMUM_SIZE;
        if (shipRNG() <
            numberBetween(factionComponentBigChances[componentIndex], bigChanceLow, bigChanceHigh) *
                bn) {
            const chance = numberBetween(factionComponentBigIncChances[componentIndex], bigIncChanceLow, bigIncChanceHigh);
            // Using for as it's smaller, even though it didn't make the zip smaller
            for (; shipRNG() < chance * bn;) {
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
    const shadowGradient = (middlePoint, edgePoint, amount) => gradientInOut(edgePoint[0], edgePoint[1], middlePoint[0] * 2 - edgePoint[0], middlePoint[1] * 2 - edgePoint[1], `rgba(0,0,0,${amount})`, `rgba(0,0,0,0)`);
    // Each component function takes an argument 'lp' (for the ship) and 'v' (an integral 2-vector denoting the center of the component)
    const components = [
        // Bordered block
        (v) => {
            const lcms = calculateLcms(0, v, 0.3, 0, 0.9, 0, 0.5);
            const dhi_0 = Math.ceil(numberBetween(shipRNG(), 1, Math.max(2, lcms / 2)));
            const dhi_1 = Math.ceil(numberBetween(shipRNG(), 1, Math.max(2, lcms / 2)));
            const borderwidth = Math.min(dhi_0, dhi_1) * numberBetween(shipRNG(), 0.1, 1.2);
            const dho_0 = dhi_0 + borderwidth * 2;
            const dho_1 = dhi_1 + borderwidth * 2;
            const counts_0 = Math.ceil(2 * lcms / dho_0);
            const counts_1 = Math.ceil(2 * lcms / dho_1);
            const trv_0 = Math.round((counts_0 * dho_0) / 2);
            const trv_1 = Math.round((counts_1 * dho_1) / 2);
            const baseColor = computeBaseColor();
            cx.fillStyle = `rgba(0,0,0,${numberBetween(shipRNG(), 0, 0.25)})`;
            cx.fillRect(v[0] - trv_0 - 1, v[1] - trv_1 - 1, dho_0 * counts_0 + 2, dho_1 * counts_1 + 2);
            cx.fillStyle = scaleColorBy(baseColor, numberBetween(shipRNG(), 0.4, 1));
            cx.fillRect(v[0] - trv_0, v[1] - trv_1, dho_0 * counts_0, dho_1 * counts_1);
            cx.fillStyle = scaleColorBy(baseColor, numberBetween(shipRNG(), 0.4, 1));
            for (let x = 0; x < counts_0; x++) {
                const bx = v[0] + borderwidth + x * dho_0 - trv_0;
                for (let y = 0; y < counts_1; y++) {
                    const by = v[1] + borderwidth + y * dho_1 - trv_1;
                    cx.fillRect(bx, by, dhi_0, dhi_1);
                }
            }
            if (shipRNG() <
                clamp(((totaldone * 0.6) / totalcomponents + 0.3) *
                    (lcms / COMPONENT_MAXIMUM_SIZE), 0, 0.98)) {
                cx.fillStyle = shadowGradient(v, [v[0] + trv_0, v[1]], numberBetween(shipRNG(), 0, 0.9));
                cx.fillRect(v[0] - trv_0, v[1] - trv_1, dho_0 * counts_0, dho_1 * counts_1);
            }
        },
        // Cylinder array
        (v) => {
            const lcms = calculateLcms(1, v, 0.2, 0.3, 1, 0, 0.6);
            const baseComponentWidth = Math.ceil(numberBetween(shipRNG(), 0.8, 2) * lcms);
            const componentHeight = Math.ceil(numberBetween(shipRNG(), 0.8, 2) * lcms);
            const cw = integerNumberBetween(shipRNG(), 3, Math.max(4, baseComponentWidth));
            const count = Math.max(1, Math.round(baseComponentWidth / cw));
            const componentWidth = count * cw;
            const baseColor = computeBaseColor();
            const ccolor = scaleColorBy(baseColor, numberBetween(shipRNG(), 0.5, 1));
            const darkness = numberBetween(shipRNG(), 0.3, 0.9);
            // true = horizontal array, false = vertical array
            const orientation = shipRNG() < clamp(factionComponent1HChance, 0, 1);
            if (orientation) {
                const bv = [
                    v[0] - Math.floor(componentWidth / 2),
                    v[1] - Math.floor(componentHeight / 2),
                ];
                cx.fillStyle = `rgba(0,0,0,${numberBetween(shipRNG(), 0, 0.25)})`;
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
                cx.fillStyle = `rgba(0,0,0,${numberBetween(shipRNG(), 0, 0.25)})`;
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
        (v) => {
            const lcms = calculateLcms(2, v, 0.05, 0, 1, 0, 0.9);
            const componentWidth = Math.ceil(numberBetween(shipRNG(), 0.6, 1.4) * lcms);
            const componentHeight = Math.ceil(numberBetween(shipRNG(), 1, 2) * lcms);
            const wh2_0 = Math.ceil(Math.max((componentWidth * numberBetween(shipRNG(), 0.7, 1)) / 2, 1));
            const wh2_1 = Math.ceil(Math.max((componentWidth * numberBetween(shipRNG(), 0.8, 1)) / 2, 1));
            const h2_0 = Math.floor(clamp(componentWidth * numberBetween(shipRNG(), 0.05, 0.25), 1, componentHeight));
            const h2_1 = Math.floor(clamp(componentWidth * numberBetween(shipRNG(), 0.1, 0.3), 1, componentHeight));
            const hpair = h2_0 + h2_1;
            const odd = shipRNG() < factionComponent2OddChance ** 0.5;
            const count = Math.max(Math.floor(componentHeight / hpair), 1);
            const htotal = count * hpair + (odd ? h2_0 : 0);
            const baseColor = computeBaseColor();
            const scale_0 = numberBetween(shipRNG(), 0.6, 1);
            const scale_1 = numberBetween(shipRNG(), 0.6, 1);
            const color2_0 = scaleColorBy(baseColor, scale_0);
            const color2_1 = scaleColorBy(baseColor, scale_1);
            const lightness = 1 - numberBetween(shipRNG(), 0.5, 0.95);
            const colord2_0 = scaleColorBy(baseColor, lightness * scale_0);
            const colord2_1 = scaleColorBy(baseColor, lightness * scale_1);
            const orientation = shipRNG() < factionComponent2VerticalChance ** 0.1;
            if (orientation) {
                const grad2_0 = gradientInOut(v[0] - wh2_0, v[1], v[0] + wh2_0, v[1], colord2_0, color2_0);
                const grad2_1 = gradientInOut(v[0] - wh2_1, v[1], v[0] + wh2_1, v[1], colord2_1, color2_1);
                const by = Math.floor(v[1] - htotal / 2);
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
                const grad2_0 = gradientInOut(v[0], v[1] - wh2_0, v[0], v[1] + wh2_0, colord2_0, color2_0);
                const grad2_1 = gradientInOut(v[0], v[1] - wh2_1, v[0], v[1] + wh2_1, colord2_1, color2_1);
                const bx = Math.floor(v[0] - htotal / 2);
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
        (v) => {
            if (shipRNG() < frontness(v) - 0.3 ||
                isCellGood(v[0], v[1] + ship_COMPONENT_GRID_SIZE * 1.2) ||
                isCellGood(v[0], v[1] + ship_COMPONENT_GRID_SIZE * 1.8)) {
                // Any component but this one
                for (;;) {
                    const which = chancePicker(shipRNG, componentChances);
                    if (which - 3) {
                        components[which](v);
                        return;
                    }
                }
            }
            const lcms = calculateLcms(3, v, 0.1, 0.6, 1, 0.3, 0.8);
            const componentWidth = numberBetween(shipRNG(), 1, 2) * lcms;
            const baseComponentHeight = Math.ceil(numberBetween(shipRNG(), 0.3, 1) * lcms);
            const nw = componentWidth * numberBetween(shipRNG(), 0.25, 0.6);
            const midwh = (componentWidth + nw) / 4;
            const componentHeight2 = Math.max(1, Math.ceil(baseComponentHeight * numberBetween(shipRNG(), 0.08, 0.25)));
            const hpair = componentHeight2 +
                Math.max(1, Math.ceil(baseComponentHeight * numberBetween(shipRNG(), 0.03, 0.15)));
            const count = Math.ceil(baseComponentHeight / hpair);
            const componentHeight = count * hpair + componentHeight2;
            const basecolor = colors[factionComponent3BaseColor];
            const by = Math.ceil(v[1] - componentHeight / 2);
            const byh_0 = by + componentHeight2;
            const byh_1 = by + hpair;
            cx.fillStyle = gradientInOut(v[0] - midwh, v[1], v[0] + midwh, v[1], scaleColorBy(basecolor, factionComponent3Lightness0Edge), scaleColorBy(basecolor, factionComponent3Lightness0Mid));
            cx.beginPath();
            cx.moveTo(v[0] - nw / 2, by);
            cx.lineTo(v[0] + nw / 2, by);
            cx.lineTo(v[0] + componentWidth / 2, by + componentHeight);
            cx.lineTo(v[0] - componentWidth / 2, by + componentHeight);
            cx.fill();
            cx.fillStyle = gradientInOut(v[0] - midwh, v[1], v[0] + midwh, v[1], scaleColorBy(basecolor, factionComponent3Lightness1Edge), scaleColorBy(basecolor, 1));
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
        (v) => {
            const cn = centerness(v, false);
            const lightmid = numberBetween(shipRNG(), 0.7, 1);
            const lightedge = numberBetween(shipRNG(), 0, 0.2);
            const baseColor = computeBaseColor();
            const colormid = scaleColorBy(baseColor, lightmid);
            const coloredge = scaleColorBy(baseColor, lightedge);
            const componentWidth = Math.max(3, Math.ceil(h *
                numberBetween(shipRNG(), 0.4, 1) ** 2 *
                factionComponent4MaxWidth));
            const hwi = Math.floor(componentWidth / 2);
            const hwe = componentWidth % 2;
            const forwards = factionComponent4DirectionC0 ** 4;
            const backwards = 0.1 * factionComponent4DirectionC1 ** 4;
            const toCenter = 0.2 * factionComponent4DirectionC2 ** 4;
            const direction = chancePicker(shipRNG, [
                forwards * (2 - cn),
                backwards,
                toCenter * (1 + cn),
            ]);
            let ev;
            // Shorter than comparing with 0
            if (!direction) {
                //forwards
                const hlimit = v[1];
                const componentHeight = Math.min(Math.max(COMPONENT_MAXIMUM_SIZE, hlimit -
                    integerNumberBetween(shipRNG(), 0, COMPONENT_MAXIMUM_SIZE * 2)), Math.floor(0.7 * h * shipRNG() ** factionComponent4HPower0));
                const bb_0_0 = v[0] - hwi, bb_0_1 = v[1] - componentHeight, bb_1_0 = v[0] + hwi + hwe;
                cx.fillStyle = gradientInOut(bb_0_0, bb_0_1, bb_1_0, bb_0_1, coloredge, colormid);
                cx.fillRect(bb_0_0, bb_0_1, componentWidth, componentHeight);
                ev = [v[0], v[1] - componentHeight];
            }
            else if (direction < 2) {
                //backwards
                const hlimit = h - v[1];
                const componentHeight = Math.min(Math.max(COMPONENT_MAXIMUM_SIZE, hlimit -
                    integerNumberBetween(shipRNG(), 0, COMPONENT_MAXIMUM_SIZE * 2)), Math.floor(0.6 * h * shipRNG() ** factionComponent4HPower1));
                const bb_0_0 = v[0] - hwi, bb_0_1 = v[1], bb_1_0 = v[0] + hwi + hwe;
                cx.fillStyle = gradientInOut(bb_0_0, bb_0_1, bb_1_0, bb_0_1, coloredge, colormid);
                cx.fillRect(bb_0_0, bb_0_1, componentWidth, componentHeight);
                ev = [v[0], v[1] + componentHeight];
            }
            else {
                // to center
                cx.fillStyle = gradientInOut(v[0], v[1] - hwi, v[0], v[1] + hwi + hwe, coloredge, colormid);
                cx.fillRect(v[0], v[1] - hwi, Math.ceil(hw - v[0]) + 1, componentWidth);
                ev = [hw, v[1]];
            }
            const coverComC = [
                0.6 * factionComponent4CoverComC0 ** 2,
                0.2 * factionComponent4CoverComC1 ** 2,
                factionComponent4CoverComC2 ** 2,
            ];
            components[chancePicker(shipRNG, coverComC)](v);
            if (isCellGood(ev[0], ev[1])) {
                const nev = [
                    ev[0] +
                        Math.round(numberBetween(shipRNG(), -1, 1) * ship_COMPONENT_GRID_SIZE),
                    ev[1] +
                        Math.round(numberBetween(shipRNG(), 1, 1) * ship_COMPONENT_GRID_SIZE),
                ];
                components[chancePicker(shipRNG, coverComC)](isCellGood(nev[0], nev[1]) ? nev : ev);
            }
        },
        //Ball
        (v) => {
            const lcms = calculateLcms(5, v, 0.1, 0, 0.9, 0, 0.8);
            const lightmid = numberBetween(shipRNG(), 0.75, 1);
            const lightedge = numberBetween(shipRNG(), 0, 0.25);
            const baseColor = computeBaseColor();
            const colormid = scaleColorBy(baseColor, lightmid);
            const coloredge = scaleColorBy(baseColor, lightedge);
            const countx = 1 +
                sequenceAdvancer(shipRNG, factionComponent5MultXC, Math.floor(1.2 * (lcms / COMPONENT_MAXIMUM_SIZE) ** 0.6));
            const county = 1 +
                sequenceAdvancer(shipRNG, factionComponent5MultYC, Math.floor(1.2 * (lcms / COMPONENT_MAXIMUM_SIZE) ** 0.6));
            const smallr = (numberBetween(shipRNG(), 0.5, 1) * lcms) / Math.max(countx, county);
            const drawr = smallr + 0.5;
            const bv = [v[0] - smallr * countx, v[1] - smallr * county];
            cx.fillStyle = `rgba(0,0,0,${numberBetween(shipRNG(), 0, 0.2)})`;
            for (let ax = 0; ax < countx; ax++) {
                const px = bv[0] + (ax * 2 + 1) * smallr;
                for (let ay = 0; ay < county; ay++) {
                    fillCircle(cx, px, bv[1] + (ay * 2 + 1) * smallr, smallr + 1);
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
                    fillCircle(cx, px, py, drawr);
                }
            }
        },
        //Forward-facing trapezoidal fin
        (v) => {
            if (nextpass <= 0 || shipRNG() < frontness(v)) {
                components[chancePicker(shipRNG, componentChances.slice(0, 6))](v);
                return;
            }
            const lcms = calculateLcms(6, v, 0.05, 0, 0.9, 0, 0.8);
            const h0 = Math.ceil(lcms * 2 * numberBetween(shipRNG(), 0.6, 1)); //Inner height, longer.
            const hh0i = Math.floor(h0 / 2);
            const hh0e = h0 % 2;
            //Outer height, shorter
            const h1 = h0 *
                numberBetween(shipRNG(), factionComponent6H1Min ** 0.5, 0.9) **
                    factionComponent6H1Power;
            const hh1i = Math.floor(h1 / 2);
            const backamount = Math.max((h1 - h0) / 2, h0 *
                (numberBetween(shipRNG(), 0, 0.45) +
                    numberBetween(shipRNG(), 0, 0.45)) *
                (factionComponent6BacknessType < 0.8
                    ? factionComponent6BacknessPositive
                    : factionComponent6BacknessNegative));
            const componentWidth = Math.ceil(lcms * numberBetween(shipRNG(), 0.7, 1) * factionComponent6Width ** 0.5);
            const hwi = Math.floor(componentWidth / 2);
            const hwe = componentWidth % 2;
            const quad = [
                [v[0] - hwi, v[1] + backamount - hh1i],
                [v[0] + hwi + hwe, v[1] - hh0i],
                [v[0] + hwi + hwe, v[1] + hh0i + hh0e],
                [v[0] - hwi, v[1] + backamount + hh1i + (h0 % 2)],
            ];
            const baseColor = computeBaseColor();
            cx.fillStyle = `rgba(0,0,0,${numberBetween(shipRNG(), 0, 0.2)})`;
            cx.beginPath();
            cx.moveTo(quad[0][0] - 1, quad[0][1]);
            cx.lineTo(quad[1][0] - 1, quad[1][1]);
            cx.lineTo(quad[2][0] - 1, quad[2][1]);
            cx.lineTo(quad[3][0] - 1, quad[3][1]);
            cx.fill();
            cx.fillStyle = scaleColorBy(baseColor, numberBetween(shipRNG(), 0.7, 1));
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
        if (nextpass < factionBaseComponentPasses) {
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
            ncell =
                goodcells[integerNumberBetween(shipRNG(), 0, goodcells.length - 1)];
            extradone++;
        }
        else {
            break;
        }
        let lv = [ncell[CELL_X], ncell[CELL_Y]];
        for (let t = 0; t < 10; t++) {
            const nv = [
                ncell[CELL_X] +
                    integerNumberBetween(shipRNG(), -ship_COMPONENT_GRID_SIZE, ship_COMPONENT_GRID_SIZE),
                ncell[CELL_Y] +
                    integerNumberBetween(shipRNG(), -ship_COMPONENT_GRID_SIZE, ship_COMPONENT_GRID_SIZE),
            ];
            if (nv[0] < 0 ||
                nv[0] > w ||
                nv[1] < 0 ||
                nv[1] > h ||
                !isOutlineFilled(nv[0], nv[1])) {
                continue;
            }
            lv = nv;
            break;
        }
        if (Math.abs(lv[0] - hw) < ship_COMPONENT_GRID_SIZE &&
            shipRNG() < factionComponentMiddleness) {
            lv[0] = hw;
        }
        components[chancePicker(shipRNG, componentChances)](lv);
        totaldone++;
    }
    // The generated ship is asymmetric, so we fix it here
    // Removing this makes the vast majority of ships look quite a bit worse
    cx.clearRect(w - hw, 0, hw, h);
    cx.scale(-1, 1);
    cx.drawImage(shipCanvas, -w, 0);
    return shipCanvas;
}

;// ./src/demo.js





function randomSeed() {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

const PIN = "\u{1F4CC}";
const CLIPBOARD = "\u{1F4CB}";
const SAVE = "\u{1F4BE}";

function createItemAction(type) {
  const pin = document.createElement("span");
  pin.textContent = type;
  pin.style.cursor = "pointer";
  return pin;
}

let generatedShips;
let generationTimeoutId = null;
let incrementShip = 0;
let incrementLayout = 0;
let incrementColor = 0;

function stop() {
  if (generationTimeoutId != null) {
    clearTimeout(generationTimeoutId);
  }
  // Restore button panel
  document.getElementById("actionButtons").style.display = "block";
  document.getElementById("stopButton").style.display = "none";
  // Ensure we stop incrementing
  incrementShip = 0;
  incrementLayout = 0;
  incrementColor = 0;
}

function update() {
  const container = document.getElementById("container");
  // Empty it
  while (container.firstChild) container.removeChild(container.firstChild);

  generatedShips = 0;
  generateNextShip();

  document.getElementById("actionButtons").style.display = "none";
  document.getElementById("stopButton").style.display = "block";
}

function scheduleNextShip() {
  generationTimeoutId = setTimeout(generateNextShip);
}

function generateNextShip() {
  const amount = parseInt(document.getElementById("amount").value) || 20;

  const shipSeedInput = document.getElementById("sseed");
  const layoutSeedInput = document.getElementById("lseed");
  const colorSeedInput = document.getElementById("cseed");
  const forceSizeInput = document.getElementById("fsize");
  if (incrementShip && shipSeedInput.value.length < 1) {
    shipSeedInput.value = 1;
  }
  if (incrementLayout && layoutSeedInput.value.length < 1) {
    layoutSeedInput.value = 1;
  }
  if (incrementColor && colorSeedInput.value.length < 1) {
    colorSeedInput.value = 1;
  }
  const shipSeed = shipSeedInput.value;
  const layoutSeed = layoutSeedInput.value;
  const colorSeed = colorSeedInput.value;
  const forceSizeValue = forceSizeInput.value;
  const ship = shipSeed.length > 0 ? Number(shipSeed) : null;
  const layout = layoutSeed.length > 0 ? Number(layoutSeed) : null;
  const color = colorSeed.length > 0 ? Number(colorSeed) : null;
  const forceSize = forceSizeValue.length > 0 ? Number(forceSizeValue) : null;
  if (incrementShip) {
    shipSeedInput.value++;
  }
  if (incrementLayout) {
    layoutSeedInput.value++;
  }
  if (incrementColor) {
    colorSeedInput.value++;
  }

  let generateOutline = voronoi_generateOutline;

  if (document.getElementById("classic").checked) {
    generateOutline = classic_generateOutline;
  } else if (document.getElementById("micro").checked) {
    generateOutline = micro_generateOutline;
  }

  const shipDiv = document.createElement("div");
  shipDiv.className = "ship";
  const infoCaption = document.createElement("div");
  const shipCaption = document.createElement("div");
  const layoutCaption = document.createElement("div");
  const colorCaption = document.createElement("div");
  const iterationLayoutSeed = layout == null ? randomSeed() : layout;
  const iterationColorSeed = color == null ? randomSeed() : color;
  const iterationShipSeed = ship == null ? randomSeed() : ship;
  const outlineCanvas = generateOutline(iterationLayoutSeed, forceSize);
  const shipCanvas = generateShip(
    outlineCanvas,
    iterationColorSeed,
    iterationShipSeed
  );
  // Check if the filter criteria is met
  const minWidthInput = document.getElementById("minwidth");
  const minHeightInput = document.getElementById("minheight");
  const maxWidthInput = document.getElementById("maxwidth");
  const maxHeightInput = document.getElementById("maxheight");
  const minWidth = minWidthInput.value.length
    ? parseInt(minWidthInput.value, 10)
    : null;
  const maxWidth = maxWidthInput.value.length
    ? parseInt(maxWidthInput.value, 10)
    : null;
  const minHeight = minHeightInput.value.length
    ? parseInt(minHeightInput.value, 10)
    : null;
  const maxHeight = maxHeightInput.value.length
    ? parseInt(maxHeightInput.value, 10)
    : null;
  if (
    (minWidth != null && shipCanvas.width < minWidth) ||
    (maxWidth != null && shipCanvas.width > maxWidth) ||
    (minHeight != null && shipCanvas.height < minHeight) ||
    (maxHeight != null && shipCanvas.height > maxHeight)
  ) {
    // Bad dimensions, just try again!
    scheduleNextShip();
    return;
  }

  // TODO: implement clipboard and save buttons
  infoCaption.textContent =
    "" + shipCanvas.width + "x" + shipCanvas.height + " ";
  const copyToClipboard = createItemAction(CLIPBOARD);
  copyToClipboard.onclick = () => {
    const text = forceSize
      ? `generateShip(${iterationColorSeed}, ${iterationShipSeed}, ${iterationLayoutSeed}, ${forceSize})`
      : `generateShip(${iterationColorSeed}, ${iterationShipSeed}, ${iterationLayoutSeed})`;
    navigator.clipboard.writeText(text);
  };
  infoCaption.appendChild(copyToClipboard);

  shipCaption.textContent = "Ship: " + String(iterationShipSeed);
  const shipPin = createItemAction(PIN);
  shipPin.onclick = () => {
    shipSeedInput.value = String(iterationShipSeed);
  };
  shipCaption.appendChild(shipPin);
  layoutCaption.textContent = "Layout: " + String(iterationLayoutSeed);
  const layoutPin = createItemAction(PIN);
  layoutPin.onclick = () => {
    layoutSeedInput.value = String(iterationLayoutSeed);
  };
  layoutCaption.appendChild(layoutPin);
  colorCaption.textContent = "Color: " + String(iterationColorSeed);
  const colorPin = createItemAction(PIN);
  colorPin.onclick = () => {
    colorSeedInput.value = String(iterationColorSeed);
  };
  colorCaption.appendChild(colorPin);
  outlineCanvas.className = "outline";
  shipDiv.appendChild(outlineCanvas);
  shipCanvas.className = "full";
  shipDiv.appendChild(shipCanvas);
  shipDiv.appendChild(infoCaption);
  shipDiv.appendChild(shipCaption);
  shipDiv.appendChild(layoutCaption);
  shipDiv.appendChild(colorCaption);
  if (forceSize) {
    const sizeCaption = document.createElement("div");
    sizeCaption.textContent = "Size: " + String(forceSize);
    shipDiv.appendChild(sizeCaption);
  }
  container.appendChild(shipDiv);

  generatedShips++;
  if (generatedShips < amount) {
    scheduleNextShip();
  } else {
    stop();
  }
}

function updateShow() {
  if (document.getElementById("full").checked) {
    document.body.dataset.show = "full";
  } else {
    document.body.dataset.show = "outlines";
  }
}

window.onload = function () {
  document
    .getElementById("randomAction")
    .addEventListener("click", update, false);
  document.getElementById("stopAction").addEventListener("click", stop, false);
  document.getElementById("snext").addEventListener(
    "click",
    () => {
      incrementShip = true;
      update();
    },
    false
  );
  document.getElementById("lnext").addEventListener(
    "click",
    () => {
      incrementLayout = true;
      update();
    },
    false
  );
  document.getElementById("cnext").addEventListener(
    "click",
    () => {
      incrementColor = true;
      update();
    },
    false
  );

  document.getElementById("full").addEventListener("change", updateShow, false);
  document
    .getElementById("outlines")
    .addEventListener("change", updateShow, false);
};

/******/ })()
;