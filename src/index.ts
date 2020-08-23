//
import { Faction } from "./faction";
import { Ship } from "./ship";

const characters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const DEFAULT_SEED_LENGTH = 16;

// min and max included
function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomSeed() {
  var s = "";
  for (var c = 0; c < DEFAULT_SEED_LENGTH; c++) {
    s = s + characters[randomIntFromInterval(0, characters.length)];
  }
  return s;
}

function renderShip(lp: Ship) {
  var done = false;
  do {
    done = lp.addcomponent();
  } while (!done);
  lp.cfx.clearRect(lp.hw + (lp.w % 2), 0, lp.w, lp.h);
  lp.cfx.scale(-1, 1);
  lp.cfx.drawImage(lp.cf, 0 - lp.w, 0);
}

export function generateShip() {
  const nfs = randomSeed();
  const sseed = randomSeed();
  const newShip = new Ship(new Faction(nfs), sseed, 100);
  renderShip(newShip);
  // currentship.cf has the canvas with the image
  // currentship.width
  // currentship.height
  return newShip.cf;
}
