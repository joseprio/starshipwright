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
import { generateShip } from 'starshipwright';

...
const shipSeed = 1;
const layoutSeed = 2;
const colorSeed = 3;
const shipCanvas = generateShip(shipSeed, layoutSeed, colorSeed); // HTML Canvas
```

## API

### `generateShip(shipSeed: number, layoutSeed:number, colorSeed: number, forceSize?: number]): HTMLCanvasElement`

Returns a canvas that contains the generated ship based on 3 numberic seeds: ship (which determines that style), layout (size & shape) and color.

### `numberBetween(target: number, a: number, b: number): number`

Converts a number between 0 and 1 to a number between [a, b)

### `integerNumberBetween(target: number, a: number, b: number): number`

Converts a number between 0 and 1 to an integer number between [a,b] (both included)

### `createNumberGenerator(seed: number): () => number`

Returns a PRNG function that will generate numbers between 0 and 1 based on a seed.

## Demo

Check it out [here](http://joseprio.github.io/starshipwright/demo/demo.html).
