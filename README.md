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
const colorSeed = 1;
const shipSeed = 2;
const layoutSeed = 3;
const shipCanvas = generateShip(colorSeed, shipSeed, layoutSeed); // HTML Canvas
```

## API

### `generateShip(colorSeed: number, shipSeed: number, layoutSeed:number, forceSize?: number]): HTMLCanvasElement`

Returns a canvas that contains the generated ship based on 3 numberic seeds: color, ship (which determines that style), layout (size & shape), and optionally a forced size`.

### `numberBetween(target: number, a: number, b: number): number`

Converts a number between 0 and 1 to a number between [a, b)

### `integerNumberBetween(target: number, a: number, b: number): number`

Converts a number between 0 and 1 to an integer number between [a,b] (both included)

### `createNumberGenerator(seed: number): () => number`

Returns a PRNG function that will generate numbers between 0 and 1 based on a seed.

## Demo

Check it out [here](http://joseprio.github.io/starshipwright/demo/demo.html).
