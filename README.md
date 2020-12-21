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
import { generateShip, generateFactionRandomizer } from 'starshipwright';

...

const faction = generateFactionRandomizer("factionRandomSeed");
const ship = generateShip(faction, "shipRandomSeed"); // HTML Canvas
```

## API

### generateFactionRandomizer(seed: string) ⇒ `Randomizer`

Returns a randomizer initialized with the specified seed.

### generateShip(faction: Randomizer, seed: string, size?: number) ⇒ `Randomizer`

Returns a canvas that contains the generated ship.

## Demo

Check it out [here](http://joseprio.github.io/starshipwright/demo/demo.html).
