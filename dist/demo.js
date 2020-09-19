import { generateShip, generateFaction } from "./index";
function update() {
    const container = document.getElementById("container");
    // Empty it
    while (container.firstChild)
        container.removeChild(container.firstChild);
    const factionSeed = document.getElementById("fseed").value;
    const size = document.getElementById("size").value;
    const faction = factionSeed.length > 1 ? generateFaction(factionSeed) : undefined;
    for (let c = 0; c < 20; c++) {
        const shipDiv = document.createElement("div");
        shipDiv.className = "ship";
        const shipCaption = document.createElement("div");
        const factionCaption = document.createElement("div");
        const currentFaction = faction || generateFaction();
        const ship = generateShip(currentFaction, undefined, size || undefined);
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
