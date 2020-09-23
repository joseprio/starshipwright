import { generateShip, generateFaction } from "./index";

const characters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const DEFAULT_SEED_LENGTH = 16;

// min and max included
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomSeed() {
  var s = "";
  for (var c = 0; c < DEFAULT_SEED_LENGTH; c++) {
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
  const faction = factionSeed.length > 1 ? generateFaction(factionSeed) : null;
  for (let c = 0; c < 20; c++) {
    const shipDiv = document.createElement("div");
    shipDiv.className = "ship";
    const shipCaption = document.createElement("div");
    const factionCaption = document.createElement("div");
    const currentFaction = faction || generateFaction(randomSeed());
    const ship = generateShip(currentFaction, randomSeed(), size || undefined);
    shipCaption.textContent = "Seed: " + ship.baseSeed;
    factionCaption.textContent = "Faction: " + currentFaction.seed;
    shipDiv.appendChild(ship.cf);
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
