//
import { Faction } from "./faction";
import { Ship } from "./ship";

function hashi(seed) {
  var t = 1206170165;
  for (var x = seed.length - 1; x >= 0; x--) {
    var c = seed.charCodeAt(x);
    t = ((t << 5) + t) ^ c ^ (t << ((c % 13) + 1)) ^ (t >> ((c % 17) + 1));
  }
  return t >>> 0;
}

function hashd(seed) {
  return (hashi("." + seed) * 4294967296 + hashi(seed)) / 18446744073709551616;
}

function zi(min, max, seed) {
  if (seed == null) {
    return Math.floor(min + Math.random() * (1 + (max - min)));
  } else {
    return Math.floor(min + hashd(seed) * (1 + (max - min)));
  }
}

var characters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomseed(n, seed) {
  var s = "";
  for (var x = 0; x < n; x++) {
    s = s + characters[zi(0, characters.length - 1, seed + "_" + x)];
  }
  return s;
}

var defaultseedlength = 16;

var currentship = null;

function renderShip() {
  if (currentship != null) {
    var done = false;
    do {
      done = currentship.addcomponent();
    } while (!done);
    currentship.cfx.clearRect(
      currentship.hw + (currentship.w % 2),
      0,
      currentship.w,
      currentship.h
    );
    currentship.cfx.scale(-1, 1);
    currentship.cfx.drawImage(currentship.cf, 0 - currentship.w, 0);
  }
}

function createShip(nfs, sseed) {
  currentship = new Ship(new Faction(nfs), sseed);
  renderShip();
  // currentship.cf has the canvas with the image
  // currentship.width
  // currentship.height
  return currentship;
}

export function newship(faction) {
  return createShip(
    faction,
    randomseed(defaultseedlength, "_" + Math.random())
  );
}

export function newfaction() {
  return newship(randomseed(defaultseedlength, "_" + Math.random()));
}
