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
export class Ship {
  f: Randomizer;
  r: Randomizer;
  size: number;
  w: number;
  hw: number;
  gwextra: number;
  h: number;
  hh: number;
  ghextra: number;
  cf: HTMLCanvasElement;

  constructor(factionRandomizer: Randomizer, p_seed: string, size?: number) {
    this.f = factionRandomizer;
    const componentChances = computeFactionComponentChances(factionRandomizer);
    const colorData = computeFactionColors(factionRandomizer);
    const shipRandomizer = new Randomizer(factionRandomizer.seed + p_seed);
    this.r = shipRandomizer;
    //The initial overall size of this ship, in pixels
    this.size =
      size == null
        ? this.r.sd(
            this.f.hd(2.5, 3.5, "size min"),
            this.f.hd(5, 7, "size max")
          ) ** 3
        : size;
    const wratio = this.r.sd(
      this.f.hd(0.5, 1, "wratio min"),
      this.f.hd(1, 1.3, "wratio max")
    );
    const hratio = this.r.sd(
      this.f.hd(0.7, 1, "hratio min"),
      this.f.hd(1.1, 1.7, "hratio max")
    );
    this.w = Math.floor(this.size * wratio) + 2 * CANVAS_SHIP_EDGE; // Maximum width of this ship, in pixels
    this.hw = Math.floor(this.w / 2);
    const gw = Math.floor((this.w - 2 * CANVAS_SHIP_EDGE) / COMPONENT_GRID_SIZE);
    this.gwextra = (this.w - gw * COMPONENT_GRID_SIZE) * 0.5;
    this.h = Math.floor(this.size * hratio) + 2 * CANVAS_SHIP_EDGE; // Maximum height of this ship, in pixels
    this.hh = Math.floor(this.h / 2);
    const gh = Math.floor((this.h - 2 * CANVAS_SHIP_EDGE) / COMPONENT_GRID_SIZE);
    this.ghextra = (this.h - gh * COMPONENT_GRID_SIZE) * 0.5;
    const cs = document.createElement("canvas"); // Canvas on which the basic outline of the ship is drawn. Ships face upwards, with front towards Y=0
    cs.width = this.w;
    cs.height = this.h;
    const csx = cs.getContext("2d");
    outlines[this.f.hchoose([1, 1, 1], "outline type")](shipRandomizer, factionRandomizer, this.w, this.h, this.hw, this.size, csx);
    const outline = csx.getImageData(0, 0, this.w, this.h);
    const cgrid: Array<Array<Cell>> = [];
    for (let gx = 0; gx < gw; gx++) {
      cgrid[gx] = [];
      for (let gy = 0; gy < gh; gy++) {
        cgrid[gx][gy] = {
          gx: gx,
          gy: gy,
          x: Math.floor(this.gwextra + (gx + 0.5) * COMPONENT_GRID_SIZE),
          y: Math.floor(this.ghextra + (gy + 0.5) * COMPONENT_GRID_SIZE),
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
    const passes = this.f.hi(1, 2, "base component passes");
    const extra = Math.max(
      1,
      Math.floor(
        goodcells.length *
          this.f.hd(0, 1 / passes, "extra component amount")
      )
    );
    const totalcomponents = passes * goodcells.length + extra;

    this.cf = document.createElement("canvas"); // Canvas on which the actual ship components are drawn. Ships face upwards, with front towards Y=0
    this.cf.width = this.w;
    this.cf.height = this.h;
    const cfx = this.cf.getContext("2d");


      //Returns the phase of the cell containing (X,Y), or 0 if there is no such cell
  function getCellPhase(x: number, y: number): number {
    const gx = Math.floor((x - this.gwextra) / COMPONENT_GRID_SIZE);
    const gy = Math.floor((y - this.ghextra) / COMPONENT_GRID_SIZE);
    if (gx < 0 || gx >= this.gw || gy < 0 || gy >= this.gh) {
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
        ncell = goodcells[this.r.si(0, goodcells.length - 1)];
        extradone++;
      } else {
        break;
      }
      let lv: Vec = [ncell.x, ncell.y];
      for (let t = 0; t < 10; t++) {
        const nv: Vec = [
          ncell.x + this.r.si(-COMPONENT_GRID_SIZE, COMPONENT_GRID_SIZE),
          ncell.y + this.r.si(-COMPONENT_GRID_SIZE, COMPONENT_GRID_SIZE),
        ];
        if (
          nv[0] < CANVAS_SHIP_EDGE ||
          nv[0] > this.w - CANVAS_SHIP_EDGE ||
          nv[1] < CANVAS_SHIP_EDGE ||
          nv[1] > this.h - CANVAS_SHIP_EDGE
        ) {
          continue;
        }
        if (getAlpha(outline, nv[0], nv[1]) <= 0) {
          continue;
        }
        lv = nv;
        break;
      }
      if (Math.abs(lv[0] - this.hw) < COMPONENT_GRID_SIZE) {
        if (this.r.sb(this.f.hd(0, 1, "com middleness"))) {
          lv[0] = this.hw;
        }
      }
      components[this.r.schoose(componentChances)](cfx, shipRandomizer, factionRandomizer, this.w, this.h, this.hw, this.hh, this.size, lv, componentChances, colorData, nextpass, totaldone, totalcomponents, getCellPhase);
      totaldone++;
    }

    // Mirror
    cfx.clearRect(this.hw + (this.w % 2), 0, this.w, this.h);
    cfx.scale(-1, 1);
    cfx.drawImage(this.cf, 0 - this.w, 0);
  }

}
 
//Returns the alpha value (0 - 255) for the pixel of csd corresponding to the point (X,Y), or -1 if (X,Y) is out of bounds.
function getAlpha(imageData: ImageData, x: number, y: number): number {
  if (x < 0 || x > imageData.width || y < 0 || y > imageData.height) {
    return -1;
  }
  return imageData.data[(y * imageData.width + x) * 4 + 3];
}
