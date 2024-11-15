import { sequenceAdvancer } from "../utils";
import { createOffscreenCanvas, createPRNGGenerator, integerNumberBetween, numberBetween } from "game-utils";
//Size of the component grid
const COMPONENT_GRID_SIZE = 6;
export function generateOutline(layoutSeed, forceSize) {
    const layoutRNG = createPRNGGenerator(layoutSeed);
    const size = forceSize || numberBetween(layoutRNG(), 2.5, 7) ** 3;
    const wratio = numberBetween(layoutRNG(), 0.5, 1.3);
    const hratio = numberBetween(layoutRNG(), 0.7, 1.7);
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
    const [shipOutline, cx] = createOffscreenCanvas(w, h); // Canvas on which the basic outline of the ship is drawn. Ships face upwards, with front towards Y=0
    cx.fillStyle = "red";
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
    return shipOutline;
}
