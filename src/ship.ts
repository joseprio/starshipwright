import { Randomizer } from "./randomizer";
import { CANVAS_SHIP_EDGE, COMPONENT_GRID_SIZE } from "./constants";
import { components } from "./components";
import { outlines } from "./outlines";
import {
  computeFactionComponentChances,
  computeFactionColors,
} from "./faction";
import type { Vec } from "./types";

type Cell = {
  gx: number;
  gy: number;
  x: number;
  y: number;
  phase: number;
};
/*
You're almost there!!

Your master plan is so smart; add all the used fields to outlines/components functions as arguments with the same name: h, w, hh, hw.
Then, move the functions inside the closure of the constructor, and conver the constructor to a simple function.
Finally, remove all the arguments except for the vector, and done!
Feel free to start with outlines, it's smaller.
getCellState is a function inside the constructor, also passed to components.
*/
export function buildShip(factionRandomizer: Randomizer, p_seed: string, size?: number): HTMLCanvasElement {
  const componentChances = computeFactionComponentChances(factionRandomizer);
  const colorData = computeFactionColors(factionRandomizer);
  const shipRandomizer = new Randomizer(factionRandomizer.seed + p_seed);
  //The initial overall size of this ship, in pixels
  size =
    size == null
      ? shipRandomizer.sd(
          factionRandomizer.hd(2.5, 3.5, "size min"),
          factionRandomizer.hd(5, 7, "size max")
        ) ** 3
      : size;
  const wratio = shipRandomizer.sd(
    factionRandomizer.hd(0.5, 1, "wratio min"),
    factionRandomizer.hd(1, 1.3, "wratio max")
  );
  const hratio = shipRandomizer.sd(
    factionRandomizer.hd(0.7, 1, "hratio min"),
    factionRandomizer.hd(1.1, 1.7, "hratio max")
  );
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
  outlines[factionRandomizer.hchoose([1, 1, 1], "outline type")](shipRandomizer, factionRandomizer, w, h, hw, size, csx);
  const outline = csx.getImageData(0, 0, w, h);
  const cgrid: Array<Array<Cell>> = [];
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
        } else {
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
        } else {
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
        } else {
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
        } else {
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
  const extra = Math.max(
    1,
    Math.floor(
      goodcells.length *
      factionRandomizer.hd(0, 1 / passes, "extra component amount")
    )
  );
  const totalcomponents = passes * goodcells.length + extra;

  const cf = document.createElement("canvas"); // Canvas on which the actual ship components are drawn. Ships face upwards, with front towards Y=0
  cf.width = w;
  cf.height = h;
  const cfx = cf.getContext("2d");


    //Returns the phase of the cell containing (X,Y), or 0 if there is no such cell
function getCellPhase(x: number, y: number): number {
  const gx = Math.floor((x - gwextra) / COMPONENT_GRID_SIZE);
  const gy = Math.floor((y - ghextra) / COMPONENT_GRID_SIZE);
  if (gx < 0 || gx >= gw || gy < 0 || gy >= gh) {
    return 0;
  }
  return cgrid[gx][gy].phase;
}

  // Add components
  let extradone = 0, nextpass = 0, nextcell = 0, totaldone = 0;

  for(;;) {
    let ncell: Cell;
    if (nextpass < passes) {
      if (nextcell < goodcells.length) {
        ncell = goodcells[nextcell];
        nextcell++;
      } else {
        nextpass++;
        ncell = goodcells[0];
        nextcell = 1;
      }
    } else if (extradone < extra) {
      ncell = goodcells[shipRandomizer.si(0, goodcells.length - 1)];
      extradone++;
    } else {
      break;
    }
    let lv: Vec = [ncell.x, ncell.y];
    for (let t = 0; t < 10; t++) {
      const nv: Vec = [
        ncell.x + shipRandomizer.si(-COMPONENT_GRID_SIZE, COMPONENT_GRID_SIZE),
        ncell.y + shipRandomizer.si(-COMPONENT_GRID_SIZE, COMPONENT_GRID_SIZE),
      ];
      if (
        nv[0] < CANVAS_SHIP_EDGE ||
        nv[0] > w - CANVAS_SHIP_EDGE ||
        nv[1] < CANVAS_SHIP_EDGE ||
        nv[1] > h - CANVAS_SHIP_EDGE
      ) {
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
    components[shipRandomizer.schoose(componentChances)](cfx, shipRandomizer, factionRandomizer, w, h, hw, hh, size, lv, componentChances, colorData, nextpass, totaldone, totalcomponents, getCellPhase);
    totaldone++;
  }

  // Mirror
  cfx.clearRect(hw + (w % 2), 0, w, h);
  cfx.scale(-1, 1);
  cfx.drawImage(cf, 0 - w, 0);

  return cf;
}
 
//Returns the alpha value (0 - 255) for the pixel of csd corresponding to the point (X,Y), or -1 if (X,Y) is out of bounds.
function getAlpha(imageData: ImageData, x: number, y: number): number {
  if (x < 0 || x > imageData.width || y < 0 || y > imageData.height) {
    return -1;
  }
  return imageData.data[(y * imageData.width + x) * 4 + 3];
}
