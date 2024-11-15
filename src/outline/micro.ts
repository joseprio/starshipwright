//r=r=>Math.random()*r
//for(i=9;i--;x.rect(44-w+t%1*5e3,50+(t|0)*132-h+r(60),2*w,2*h))w=r(32),h=r(32)
//x.fill`evenodd`

import {
  createOffscreenCanvas,
  createPRNGGenerator,
  integerNumberBetween,
  numberBetween
} from "game-utils";
  
export function generateOutline(
  layoutSeed: number,
  forceSize?: number,
): HTMLCanvasElement {
  const layoutRNG = createPRNGGenerator(layoutSeed);
  const size = forceSize || numberBetween(layoutRNG(), 2.5, 7) ** 3;
  const halfSize = Math.floor(size/2);

  const [shipOutline, cx] = createOffscreenCanvas(size, 3*size); // Canvas on which the basic outline of the ship is drawn. Ships face upwards, with front towards Y=0
  cx.fillStyle = "red";

  for (let i = integerNumberBetween(layoutRNG(), 1, size/10); i--; ) {
    const rectWidth = integerNumberBetween(layoutRNG(), 1, halfSize);
    const rectHeight = integerNumberBetween(layoutRNG(), 1, halfSize);
    cx.rect(halfSize - rectWidth, halfSize - rectHeight + integerNumberBetween(layoutRNG(), 1, size*2), 2* rectWidth, 2* rectHeight)
  }

  cx.fill(layoutRNG() < 0.5 ? 'evenodd' : undefined);
  return shipOutline;
}