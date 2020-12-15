import { generateShip, generateFactionRandomizer } from "./index";

const characters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const DEFAULT_SEED_LENGTH = 16;

// min and max included
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomSeed() {
  let s = "";
  for (let c = 0; c < DEFAULT_SEED_LENGTH; c++) {
    s = s + characters[randomIntFromInterval(0, characters.length - 1)];
  }
  return s;
}

function update() {
  const container = document.getElementById("container");
  // Empty it
  while (container.firstChild) container.removeChild(container.firstChild);

  const factionSeed = document.getElementById("fseed").value;
  const size = document.getElementById("size").value;
  const faction =
    factionSeed.length > 1 ? generateFactionRandomizer(factionSeed) : null;
  for (let c = 0; c < 20; c++) {
    const shipDiv = document.createElement("div");
    shipDiv.className = "ship";
    const shipCaption = document.createElement("div");
    const factionCaption = document.createElement("div");
    const iterationFactionSeed = randomSeed();
    const currentFaction =
      faction || generateFactionRandomizer(iterationFactionSeed);
    const shipSeed = randomSeed();
    const shipCanvas = generateShip(
      currentFaction,
      shipSeed,
      size || undefined
    );
    shipCaption.textContent = "Seed: " + shipSeed;
    factionCaption.textContent =
      "Faction: " + faction ? factionSeed : iterationFactionSeed;
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
