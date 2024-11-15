import {
  createOffscreenCanvas,
  createPRNGGenerator,
  integerNumberBetween,
  numberBetween
} from "game-utils";

//Size of the component grid
const COMPONENT_GRID_SIZE = 6;

export function generateOutline(
    layoutSeed: number,
    forceSize?: number,
  ): HTMLCanvasElement {
    const layoutRNG = createPRNGGenerator(layoutSeed);
    const size = forceSize || numberBetween(layoutRNG(), 2.5, 7) ** 3;
    const wratio = numberBetween(layoutRNG(), 0.5, 1.3);
    const hratio = numberBetween(layoutRNG(), 0.7, 1.7);
    const layoutOutline1InitialWidth = numberBetween(layoutRNG(), 0.1, 1);
    const layoutOutline1CircleCount = numberBetween(layoutRNG(), 10, 50);
    const layoutOutline1FrontBias = numberBetween(layoutRNG(), 0.5, 1.5);

    const aliasedCircle = (xc: number, yc: number, r: number) => {
        let x = r = Math.round(r), y = 0, cd = 0;
        xc = Math.round(xc);
        yc = Math.round(yc);
      
        // middle line
        cx.fillRect(xc - x, yc, 2 * r, 1);
      
        for (;x-- > y++;) {
          cd -= x - y;
          if (cd < 0) cd += x++;
          cx.fillRect(xc - y, yc - x, 2 * y, 1);    // upper 1/4
          cx.fillRect(xc - x, yc - y, 2 * x, 1);    // upper 2/4
          cx.fillRect(xc - x, yc + y, 2 * x, 1);    // lower 3/4
          cx.fillRect(xc - y, yc + x, 2 * y, 1);    // lower 4/4
        }
      };
    

    const w = Math.floor(size * wratio); // Maximum width of this ship, in pixels
    const h = Math.floor(size * hratio); // Maximum height of this ship, in pixels
    const hw = Math.floor(w / 2);

    const [shipOutline, cx] = createOffscreenCanvas(w, h); // Canvas on which the basic outline of the ship is drawn. Ships face upwards, with front towards Y=0
    const csarealimit = (w * h) / 20;

    cx.fillStyle = "red";

    const csrlimit = Math.max(2, (csarealimit / Math.PI) ** 0.5);
    const initialwidth = Math.ceil((w * layoutOutline1InitialWidth) / 5);
    const circles: Array<[number, number, number]> = [];
    const initialcount = Math.floor(h / (initialwidth * 2));
    for (let i = 0; i < initialcount; i++) {
        circles.push([hw, h - initialwidth * (i * 2 + 1), initialwidth ]);
    }
    const circlecount =
        initialcount +
        Math.floor(
        numberBetween(layoutRNG(), 0.5, 1) *
            layoutOutline1CircleCount *
            size ** 0.5
        );
    for (let i = initialcount; i < circlecount; i++) {
        const base =
        circles[
            Math.max(
            integerNumberBetween(layoutRNG(), 0, circles.length - 1),
            integerNumberBetween(layoutRNG(), 0, circles.length - 1)
            )
        ];
        let ncr = numberBetween(layoutRNG(), 1, csrlimit);
        const pr = numberBetween(layoutRNG(), Math.max(0, base[2] - ncr), base[2]);
        let pa = numberBetween(layoutRNG(), 0, 2 * Math.PI);
        if (pa > Math.PI && layoutRNG() < layoutOutline1FrontBias) {
        pa = numberBetween(layoutRNG(), 0, Math.PI);
        }
        let lv0 = base[0] + Math.cos(pa) * pr, lv1 = base[1] + Math.sin(pa) * pr;
        ncr = Math.min(ncr, lv0, w - lv0, lv1, h - lv1);
        circles.push([lv0, lv1, ncr ]);
    }
    circles.map(([x, y, r]) => {
        aliasedCircle(x, y, r);
        aliasedCircle(w - x, y, r);
    });
      
    return shipOutline;
}