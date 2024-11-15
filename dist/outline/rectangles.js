import { createOffscreenCanvas, createPRNGGenerator, integerNumberBetween, numberBetween } from "game-utils";
export function generateOutline(layoutSeed, forceSize) {
    const layoutRNG = createPRNGGenerator(layoutSeed);
    const size = forceSize || numberBetween(layoutRNG(), 2.5, 7) ** 3;
    const wratio = numberBetween(layoutRNG(), 0.5, 1.3);
    const hratio = numberBetween(layoutRNG(), 0.7, 1.7);
    const layoutOutline0InitialWidth = numberBetween(layoutRNG(), 0.1, 1);
    const layoutOutline0BlockCount = numberBetween(layoutRNG(), 2, 8);
    const layoutOutline0FrontBias = numberBetween(layoutRNG(), 0.5, 1.5);
    const w = Math.floor(size * wratio); // Maximum width of this ship, in pixels
    const h = Math.floor(size * hratio); // Maximum height of this ship, in pixels
    const hw = Math.floor(w / 2);
    const [shipOutline, cx] = createOffscreenCanvas(w, h); // Canvas on which the basic outline of the ship is drawn. Ships face upwards, with front towards Y=0
    const csarealimit = (w * h) / 20;
    cx.fillStyle = "red";
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
    return shipOutline;
}
