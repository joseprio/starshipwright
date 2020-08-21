import { newfaction } from "./index.js";

function createShip() {
  const ship = newfaction();
  const canvas = document.createElement("canvas");
  canvas.width = ship.w;
  canvas.height = ship.h;

  const context = canvas.getContext("2d");
  context.drawImage(ship.cf, 0, 0);
  return canvas;
}

window.onload = function () {
  for (let c = 0; c < 3; c++) {
    document.body.appendChild(createShip());
  }
};
