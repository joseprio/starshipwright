import { createCanvas, createPRNGGenerator, numberBetween, obtainImageData, obtainPixelArray } from "game-utils";
const SPRITE_CENTER_X = 0;
const SPRITE_CENTER_Y = 1;
const SPRITE_OFFSET_X = 2;
const SPRITE_OFFSET_Y = 3;
const SPRITE_CANVAS = 4;
function createSprites(targetCanvas, rng, desiredSize) {
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
                collector[COLLECTOR_CENTER_X],
                collector[COLLECTOR_CENTER_Y],
                collector[COLLECTOR_MIN_X] - collector[COLLECTOR_CENTER_X],
                collector[COLLECTOR_MIN_Y] - collector[COLLECTOR_CENTER_Y],
                shardCanvas,
            ]);
        }
    });
    return sprites;
}
export function generateOutline(layoutSeed, forceSize) {
    const layoutRNG = createPRNGGenerator(layoutSeed);
    const size = forceSize || numberBetween(layoutRNG(), 2.5, 7) ** 3;
    const halfSize = Math.floor(size / 2);
    const [shipOutline, shipOutlineContext] = createCanvas(size, size);
    const [piecesCanvas, piecesCanvasContext] = createCanvas(size, size);
    piecesCanvasContext.fillStyle = "red";
    piecesCanvasContext.fillRect(0, 0, size, size);
    const sprites = createSprites(piecesCanvas, layoutRNG, size / numberBetween(layoutRNG(), 3, 6));
    for (let i = sprites.length; i--;) {
        const spriteCanvas = sprites[i][SPRITE_CANVAS];
        const topX = halfSize + sprites[i][SPRITE_OFFSET_X];
        const topY = halfSize + sprites[i][SPRITE_OFFSET_Y];
        if (topX > 0 &&
            topY > 0 &&
            topX + spriteCanvas.width < size &&
            topY + spriteCanvas.height < size) {
            shipOutlineContext.drawImage(spriteCanvas, topX, topY);
        }
    }
    return shipOutline;
}
