import { generateShip } from "./index";

function randomSeed() {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

function update() {
  const container = document.getElementById("container");
  // Empty it
  while (container.firstChild) container.removeChild(container.firstChild);

  const factionSeed = document.getElementById("fseed").value;
  const size = document.getElementById("size").value;
  const faction = factionSeed.length > 1 ? Number(factionSeed) : null;
  for (let c = 0; c < 20; c++) {
    const shipDiv = document.createElement("div");
    shipDiv.className = "ship";
    const shipCaption = document.createElement("div");
    const factionCaption = document.createElement("div");
    const iterationFactionSeed = faction == null ? randomSeed() : faction;
    const shipSeed = randomSeed();
    const shipCanvas = generateShip(
      iterationFactionSeed,
      shipSeed,
      size || undefined
    );
    shipCaption.textContent = "Seed: " + shipSeed;
    factionCaption.textContent = "Faction: " + String(iterationFactionSeed);
    shipDiv.appendChild(shipCanvas);
    shipDiv.appendChild(shipCaption);
    shipDiv.appendChild(factionCaption);
    container.appendChild(shipDiv);
  }
}

window.onload = function () {
  document
    .getElementById("updateAction")
    .addEventListener("click", update, false);
};
