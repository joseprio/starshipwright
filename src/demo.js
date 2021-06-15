import { generateShip } from "./index";

function randomSeed() {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

function update() {
  const container = document.getElementById("container");
  // Empty it
  while (container.firstChild) container.removeChild(container.firstChild);

  const shipSeed = document.getElementById("sseed").value;
  const layoutSeed = document.getElementById("lseed").value;
  const colorSeed = document.getElementById("cseed").value;
  const ship = shipSeed.length > 0 ? Number(shipSeed) : null;
  const layout = layoutSeed.length > 0 ? Number(layoutSeed) : null;
  const color = colorSeed.length > 0 ? Number(colorSeed) : null;

  for (let c = 0; c < 20; c++) {
    const shipDiv = document.createElement("div");
    shipDiv.className = "ship";
    const shipCaption = document.createElement("div");
    const layoutCaption = document.createElement("div");
    const colorCaption = document.createElement("div");
    const iterationLayoutSeed = layout == null ? randomSeed() : layout;
    const iterationColorSeed = color == null ? randomSeed() : color;
    const iterationShipSeed = ship == null ? randomSeed() : ship;
    const shipCanvas = generateShip(
      iterationShipSeed,
      iterationLayoutSeed,
      iterationColorSeed
    );
    shipCaption.textContent = "Ship: " + String(iterationShipSeed);
    layoutCaption.textContent = "Layout: " + String(iterationLayoutSeed);
    colorCaption.textContent = "Color: " + String(iterationColorSeed);
    shipDiv.appendChild(shipCanvas);
    shipDiv.appendChild(shipCaption);
    shipDiv.appendChild(layoutCaption);
    shipDiv.appendChild(colorCaption);
    container.appendChild(shipDiv);
  }
}

window.onload = function () {
  document
    .getElementById("updateAction")
    .addEventListener("click", update, false);
};
