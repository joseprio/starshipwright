import { generateShip } from "./index";

window.onload = function () {
  for (let c = 0; c < 20; c++) {
    document.body.appendChild(generateShip());
  }
};
