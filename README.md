# Starshipwright

JS library to procedurally generate starships. Based on a [procedural generation monthly challenge entry from Reddit](https://www.reddit.com/r/proceduralgeneration/comments/4quifo/monthly_challenge_7_2d_spaceships_in/) by green_meklar, used with permission.

## Installation

```sh
# npm
npm install starshipwright --save

# yarn
yarn add starshipwright
```

## Usage

```js
import { generateShip, generateOutlineClassic } from 'starshipwright';
...
const colorSeed = 1;
const shipSeed = 2;
const layoutSeed = 3;
const outline = generateOutlineClassic(layoutSeed);
const shipCanvas = generateShip(outline, colorSeed, shipSeed); // HTML Canvas
```

## API

### `generateShip(outline: HTMLCanvasElement, colorSeed: number, shipSeed: number): HTMLCanvasElement`

Returns a canvas that contains the generated ship based on an outline and 2 numeric seeds: color, ship (which determines that style), layout (size & shape), and optionally a forced size`.

### `generateOutlineVoronoi(layoutSeed: number, forceSize?: number): HTMLCanvasElement`

Returns a canvas representing the outline of the ship; internally, it uses a voronoi algorithm to create the shape. The layout seed determines the size and shape, and it's possible to force a size with the `forceSize` parameter.


### `generateOutlineClassic(layoutSeed: number, forceSize?: number): HTMLCanvasElement`

Returns a canvas representing the outline of the ship; internally, it uses the original algorithm to create the shape. The layout seed determines the size and shape, and it's possible to force a size with the `forceSize` parameter.


### `generateOutlineMicro(layoutSeed: number, forceSize?: number): HTMLCanvasElement`

Returns a canvas representing the outline of the ship; internally, it uses a algorithm focused on byte size to create the shape. The layout seed determines the size and shape, and it's possible to force a size with the `forceSize` parameter.

## Demo

Check it out [here](http://joseprio.github.io/starshipwright/demo/demo.html).
