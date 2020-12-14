import { Randomizer } from "./randomizer";
import { CANVAS_SHIP_EDGE, COMPONENT_GRID_SIZE } from "./constants";
import { components } from "./components";
import { outlines } from "./outlines";
import {
  computeFactionComponentChances,
  computeFactionColors,
  ColorData,
  ComponentChances
} from "./faction";
import type { RGBColor, Vec } from "./types";

type Cell = {
  gx: number;
  gy: number;
  x: number;
  y: number;
  phase: number;
};

export class Ship {
  f: Randomizer;
  baseSeed: string;
  seed: string;
  r: Randomizer;
  size: number;
  w: number;
  hw: number;
  gw: number;
  gwextra: number;
  h: number;
  hh: number;
  gh: number;
  ghextra: number;
  cf: HTMLCanvasElement;
  passes: number;
  extra: number;
  totalcomponents: number;
  totaldone: number = 0;
  cgrid: Array<Array<Cell>>;
  csd: ImageData;

  constructor(factionRandomizer: Randomizer, p_seed: string, size?: number) {
    this.f = factionRandomizer;
    const componentChances = computeFactionComponentChances(this.f);
    const colorData = computeFactionColors(this.f);
    //Base seed for this ship, without appending the faction seed
    this.baseSeed = p_seed;
    this.seed = this.f.seed + this.baseSeed;
    this.r = new Randomizer(this.seed);
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
    this.gw = Math.floor((this.w - 2 * CANVAS_SHIP_EDGE) / COMPONENT_GRID_SIZE);
    this.gwextra = (this.w - this.gw * COMPONENT_GRID_SIZE) * 0.5;
    this.h = Math.floor(this.size * hratio) + 2 * CANVAS_SHIP_EDGE; // Maximum height of this ship, in pixels
    this.hh = Math.floor(this.h / 2);
    this.gh = Math.floor((this.h - 2 * CANVAS_SHIP_EDGE) / COMPONENT_GRID_SIZE);
    this.ghextra = (this.h - this.gh * COMPONENT_GRID_SIZE) * 0.5;
    const cs = document.createElement("canvas"); // Canvas on which the basic outline of the ship is drawn. Ships face upwards, with front towards Y=0
    cs.width = this.w;
    cs.height = this.h;
    const csx = cs.getContext("2d");
    outlines[this.f.hchoose([1, 1, 1], "outline type")](this, csx);
    this.csd = csx.getImageData(0, 0, this.w, this.h);
    this.cgrid = [];
    for (let gx = 0; gx < this.gw; gx++) {
      this.cgrid[gx] = [];
      for (let gy = 0; gy < this.gh; gy++) {
        this.cgrid[gx][gy] = {
          gx: gx,
          gy: gy,
          x: Math.floor(this.gwextra + (gx + 0.5) * COMPONENT_GRID_SIZE),
          y: Math.floor(this.ghextra + (gy + 0.5) * COMPONENT_GRID_SIZE),
          phase: 0,
        }; // Phase is 0 for unchecked, 1 for checked and good, and -1 for checked and bad
      }
    }
    const goodcells = [
      this.cgrid[Math.floor(this.gw / 2)][Math.floor(this.gh / 2)],
    ];
    let nextcheck = 0;
    while (nextcheck < goodcells.length) {
      const lcell = goodcells[nextcheck];
      if (lcell.gx > 0) {
        const ncell = this.cgrid[lcell.gx - 1][lcell.gy];
        if (ncell.phase == 0) {
          if (this.getspa(ncell.x, ncell.y) > 0) {
            ncell.phase = 1;
            goodcells.push(ncell);
          } else {
            ncell.phase = -1;
          }
        }
      }
      if (lcell.gx < this.gw - 1) {
        const ncell = this.cgrid[lcell.gx + 1][lcell.gy];
        if (ncell.phase == 0) {
          if (this.getspa(ncell.x, ncell.y) > 0) {
            ncell.phase = 1;
            goodcells.push(ncell);
          } else {
            ncell.phase = -1;
          }
        }
      }
      if (lcell.gy > 0) {
        const ncell = this.cgrid[lcell.gx][lcell.gy - 1];
        if (ncell.phase == 0) {
          if (this.getspa(ncell.x, ncell.y) > 0) {
            ncell.phase = 1;
            goodcells.push(ncell);
          } else {
            ncell.phase = -1;
          }
        }
      }
      if (lcell.gy < this.gh - 1) {
        const ncell = this.cgrid[lcell.gx][lcell.gy + 1];
        if (ncell.phase == 0) {
          if (this.getspa(ncell.x, ncell.y) > 0) {
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
      const ocell = this.cgrid[this.gw - 1 - lcell.gx][lcell.gy];
      if (ocell.phase != 1) {
        ocell.phase = 1;
        goodcells.push(ocell);
      }
    }
    this.passes = this.f.hi(1, 2, "base component passes");
    this.extra = Math.max(
      1,
      Math.floor(
        goodcells.length *
          this.f.hd(0, 1 / this.passes, "extra component amount")
      )
    );
    this.totalcomponents = this.passes * goodcells.length + this.extra;

    this.cf = document.createElement("canvas"); // Canvas on which the actual ship components are drawn. Ships face upwards, with front towards Y=0
    this.cf.width = this.w;
    this.cf.height = this.h;
    const cfx = this.cf.getContext("2d");

    this.addComponents(cfx, componentChances, colorData, goodcells);

    // Mirror
    cfx.clearRect(this.hw + (this.w % 2), 0, this.w, this.h);
    cfx.scale(-1, 1);
    cfx.drawImage(this.cf, 0 - this.w, 0);
  }

  // Returns the cell containing (X,Y), if there is one, or null otherwise
  getcell(x: number, y: number) {
    const gx = Math.floor((x - this.gwextra) / COMPONENT_GRID_SIZE);
    const gy = Math.floor((y - this.ghextra) / COMPONENT_GRID_SIZE);
    if (gx < 0 || gx >= this.gw || gy < 0 || gy >= this.gh) {
      return null;
    }
    return this.cgrid[gx][gy];
  }

  //Returns the phase of the cell containing (X,Y), or 0 if there is no such cell
  getCellPhase(x: number, y: number): number {
    const lcell = this.getcell(x, y);
    if (lcell == null) {
      return 0;
    }
    return lcell.phase;
  }

  //Returns the alpha value (0 - 255) for the pixel of csd corresponding to the point (X,Y), or -1 if (X,Y) is out of bounds.
  getspa(x: number, y: number): number {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || x > this.w || y < 0 || y > this.h) {
      return -1;
    }
    return this.csd.data[(y * this.w + x) * 4 + 3];
  }

  getpcdone() {
    return this.totaldone / this.totalcomponents;
  }

  addComponents(cfx: CanvasRenderingContext2D, componentChances: ComponentChances, colorData: ColorData, goodcells: Array<Cell>) {
    let extradone = 0, nextpass = 0, nextcell = 0;

    while(true) {
      let ncell: Cell;
      if (nextpass < this.passes) {
        if (nextcell < goodcells.length) {
          ncell = goodcells[nextcell];
          nextcell++;
        } else {
          nextpass++;
          ncell = goodcells[0];
          nextcell = 1;
        }
      } else if (extradone < this.extra) {
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
        if (this.getspa(nv[0], nv[1]) <= 0) {
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
      components[this.r.schoose(componentChances)](cfx, this, lv, componentChances, colorData, nextpass);
      this.totaldone++;
    }
  } 
}
