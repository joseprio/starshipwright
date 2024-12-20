import type {CanvasFragment, RandomNumberGenerator} from "game-utils";
import {
  createOffscreenCanvas,
  createCanvasFragments,
  createPRNGGenerator,
  integerNumberBetween,
  numberBetween
} from "game-utils";

export function generateOutline(
  layoutSeed: number,
  forceSize?: number
): HTMLCanvasElement {
  const layoutRNG = createPRNGGenerator(layoutSeed);
  const size = forceSize || integerNumberBetween(layoutRNG(), 2.5, 7) ** 3;

  const [shipOutline, shipOutlineContext] = createOffscreenCanvas(size, size);
  const [piecesCanvas, piecesCanvasContext] = createOffscreenCanvas(size, size);
  piecesCanvasContext.fillStyle = "red";
  piecesCanvasContext.fillRect(0, 0, size, size);

  const minPieceSize = Math.min(Math.floor(size / 3), 5);
  const pieceSize = numberBetween(layoutRNG(), minPieceSize, Math.max(minPieceSize, size/4));
  const sprites = createCanvasFragments(piecesCanvas, layoutRNG, pieceSize);

  for (let i = sprites.length; i--; ) {
    const [spriteCanvas, left, top] = sprites[i];
    if (left > 0 &&
      top > 0 &&
      left + spriteCanvas.width < size &&
      top + spriteCanvas.height < size
      ) {
        shipOutlineContext.drawImage(spriteCanvas, left, top);
      }
  }
  return shipOutline;
}
