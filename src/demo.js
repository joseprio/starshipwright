import { generateShip } from "./index";

function randomSeed() {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

const PIN = "\u{1F4CC}";
const CLIPBOARD = "\u{1F4CB}";
const SAVE = "\u{1F4BE}";

function createItemAction(type) {
  const pin = document.createElement("span");
  pin.textContent = type;
  pin.style.cursor = "pointer";
  return pin;
}

let generatedShips;
let generationTimeoutId = null;
let incrementShip = 0;
let incrementLayout = 0;
let incrementColor = 0;

function stop() {
  if (generationTimeoutId != null) {
    clearTimeout(generationTimeoutId);
  }
  // Restore button panel
  document.getElementById("actionButtons").style.display = "block";
  document.getElementById("stopButton").style.display = "none";
  // Ensure we stop incrementing
  incrementShip = 0;
  incrementLayout = 0;
  incrementColor = 0;
}

function update() {
  const container = document.getElementById("container");
  // Empty it
  while (container.firstChild) container.removeChild(container.firstChild);

  generatedShips = 0;
  generateNextShip();

  document.getElementById("actionButtons").style.display = "none";
  document.getElementById("stopButton").style.display = "block";
}

function scheduleNextShip() {
  generationTimeoutId = setTimeout(generateNextShip);
}

function generateNextShip() {
  const amount = parseInt(document.getElementById("amount").value) || 20;

  const shipSeedInput = document.getElementById("sseed");
  const layoutSeedInput = document.getElementById("lseed");
  const colorSeedInput = document.getElementById("cseed");
  const forceSizeInput = document.getElementById("fsize");
  if (incrementShip && shipSeedInput.value.length < 1) {
    shipSeedInput.value = 1;
  }
  if (incrementLayout && layoutSeedInput.value.length < 1) {
    layoutSeedInput.value = 1;
  }
  if (incrementColor && colorSeedInput.value.length < 1) {
    colorSeedInput.value = 1;
  }
  const shipSeed = shipSeedInput.value;
  const layoutSeed = layoutSeedInput.value;
  const colorSeed = colorSeedInput.value;
  const forceSizeValue = forceSizeInput.value;
  const ship = shipSeed.length > 0 ? Number(shipSeed) : null;
  const layout = layoutSeed.length > 0 ? Number(layoutSeed) : null;
  const color = colorSeed.length > 0 ? Number(colorSeed) : null;
  const forceSize = forceSizeValue.length > 0 ? Number(forceSizeValue) : null;
  if (incrementShip) {
    shipSeedInput.value++;
  }
  if (incrementLayout) {
    layoutSeedInput.value++;
  }
  if (incrementColor) {
    colorSeedInput.value++;
  }

  const shipDiv = document.createElement("div");
  shipDiv.className = "ship";
  const infoCaption = document.createElement("div");
  const shipCaption = document.createElement("div");
  const layoutCaption = document.createElement("div");
  const colorCaption = document.createElement("div");
  const iterationLayoutSeed = layout == null ? randomSeed() : layout;
  const iterationColorSeed = color == null ? randomSeed() : color;
  const iterationShipSeed = ship == null ? randomSeed() : ship;
  const shipCanvas = generateShip(
    iterationShipSeed,
    iterationLayoutSeed,
    iterationColorSeed,
    forceSize
  );
  // Check if the filter criteria is met
  const minWidthInput = document.getElementById("minwidth");
  const minHeightInput = document.getElementById("minheight");
  const maxWidthInput = document.getElementById("maxwidth");
  const maxHeightInput = document.getElementById("maxheight");
  const minWidth = minWidthInput.value.length
    ? parseInt(minWidthInput.value, 10)
    : null;
  const maxWidth = maxWidthInput.value.length
    ? parseInt(maxWidthInput.value, 10)
    : null;
  const minHeight = minHeightInput.value.length
    ? parseInt(minHeightInput.value, 10)
    : null;
  const maxHeight = maxHeightInput.value.length
    ? parseInt(maxHeightInput.value, 10)
    : null;
  if (
    (minWidth != null && shipCanvas.width < minWidth) ||
    (maxWidth != null && shipCanvas.width > maxWidth) ||
    (minHeight != null && shipCanvas.height < minHeight) ||
    (maxHeight != null && shipCanvas.height > maxHeight)
  ) {
    // Bad dimensions, just try again!
    scheduleNextShip();
    return;
  }

  // TODO: implement clipboard and save buttons
  infoCaption.textContent =
    "" + shipCanvas.width + "x" + shipCanvas.height + " ";
  const copyToClipboard = createItemAction(CLIPBOARD);
  copyToClipboard.onclick = () => {
    const text = forceSize
      ? `generateShip(${iterationShipSeed}, ${iterationLayoutSeed}, ${iterationColorSeed}, ${forceSize})`
      : `generateShip(${iterationShipSeed}, ${iterationLayoutSeed}, ${iterationColorSeed})`;
    navigator.clipboard.writeText(text);
  };
  infoCaption.appendChild(copyToClipboard);

  shipCaption.textContent = "Ship: " + String(iterationShipSeed);
  const shipPin = createItemAction(PIN);
  shipPin.onclick = () => {
    shipSeedInput.value = String(iterationShipSeed);
  };
  shipCaption.appendChild(shipPin);
  layoutCaption.textContent = "Layout: " + String(iterationLayoutSeed);
  const layoutPin = createItemAction(PIN);
  layoutPin.onclick = () => {
    layoutSeedInput.value = String(iterationLayoutSeed);
  };
  layoutCaption.appendChild(layoutPin);
  colorCaption.textContent = "Color: " + String(iterationColorSeed);
  const colorPin = createItemAction(PIN);
  colorPin.onclick = () => {
    colorSeedInput.value = String(iterationColorSeed);
  };
  colorCaption.appendChild(colorPin);
  shipDiv.appendChild(shipCanvas);
  shipDiv.appendChild(infoCaption);
  shipDiv.appendChild(shipCaption);
  shipDiv.appendChild(layoutCaption);
  shipDiv.appendChild(colorCaption);
  if (forceSize) {
    const sizeCaption = document.createElement("div");
    sizeCaption.textContent = "Size: " + String(forceSize);
    shipDiv.appendChild(sizeCaption);
  }
  container.appendChild(shipDiv);

  generatedShips++;
  if (generatedShips < amount) {
    scheduleNextShip();
  } else {
    stop();
  }
}

window.onload = function () {
  document
    .getElementById("randomAction")
    .addEventListener("click", update, false);
  document.getElementById("stopAction").addEventListener("click", stop, false);
  document.getElementById("snext").addEventListener(
    "click",
    () => {
      incrementShip = true;
      update();
    },
    false
  );
  document.getElementById("lnext").addEventListener(
    "click",
    () => {
      incrementLayout = true;
      update();
    },
    false
  );
  document.getElementById("cnext").addEventListener(
    "click",
    () => {
      incrementColor = true;
      update();
    },
    false
  );
};
