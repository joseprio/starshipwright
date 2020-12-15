/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./src/randomizer.ts
class Randomizer {
    constructor(p_seed) {
        this.seedPosition = 0;
        this.arrayPosition = 0;
        this.hrCache = {};
        this.seed = p_seed;
        if (this.seed.length < 8) {
            this.seed = "padding_" + this.seed;
        }
        if (this.seed.length % 2 == 0) {
            this.seed = "1" + this.seed;
        }
        this.stateArray = [
            2972948403,
            3086140710,
            2071788248,
            3026137486,
            1411764137,
            2265725585,
            2923087685,
            1593177610,
        ];
        this.current = 3234042090;
        for (let i = this.seed.length - 1; i >= 0; i--) {
            const c = this.seed.charCodeAt(i);
            this.current =
                (((this.current << 5) + this.current) ^
                    c ^
                    (this.current << ((c % 13) + 1)) ^
                    (this.current >> ((c % 17) + 1))) >>>
                    0;
            this.stateArray[i % 8] ^=
                (((this.current >> 9) * ((this.current % 16384) + 3427)) ^ c) >>> 0;
        }
    }
    //Returns a raw unsigned 32-bit integer from the stream.
    sr() {
        const c = this.seed.charCodeAt(this.seedPosition);
        const lsa = this.stateArray[this.arrayPosition];
        this.current =
            (((this.current << 5) + this.current + lsa) ^
                c ^
                (this.current << ((c % 17) + 1)) ^
                (this.current >> ((c % 13) + 1))) >>>
                0;
        this.stateArray[this.arrayPosition] =
            ((lsa >> 3) ^
                (lsa << ((c % 19) + 1)) ^
                ((this.current % 134217728) * 3427)) >>>
                0;
        this.seedPosition = (this.seedPosition + 1) % this.seed.length;
        this.arrayPosition = (this.arrayPosition + 1) % 8;
        return this.current;
    }
    //Returns a raw unsigned 32-bit integer based on hashing this object's seed with the specified string.
    /*
    hr_original(seed?: string): number {
      let t = 1206170165;
      if (seed != null) {
        for (let x = seed.length - 1; x >= 0; x--) {
          const c = seed.charCodeAt(x);
          t = ((t << 5) + t) ^ c ^ (t << ((c % 13) + 1)) ^ (t >> ((c % 17) + 1));
        }
      }
      for (let y = this.seed.length - 1; y >= 0; y--) {
        const c = this.seed.charCodeAt(y);
        t = ((t << 5) + t) ^ c ^ (t << ((c % 13) + 1)) ^ (t >> ((c % 17) + 1));
      }
      return t >>> 0;
    }
    */
    //Returns a raw unsigned 32-bit integer based on hashing this object's seed with the specified string
    hr(seed) {
        const state = [1160605769, 1424711319, 876532818, 1419174464];
        let rv = 1206170165;
        if (seed == null) {
            seed = "?/?/?/";
            rv = 3379896793;
        }
        if (this.hrCache.hasOwnProperty(seed)) {
            return this.hrCache[seed];
        }
        for (let x = seed.length - 1; x >= 0; x--) {
            const c = seed.charCodeAt(x);
            let t = state[0] ^ c;
            t = (t ^ (t << 11)) >>> 0;
            t = (t ^ (t >> 8)) >>> 0;
            state[0] = state[1];
            state[1] = state[2];
            state[2] = state[3];
            state[3] = (state[3] ^ (state[3] >> 19) ^ t) >>> 0;
            rv = ((rv ^ (c << 24)) * 3427) ^ state[3];
        }
        for (let y = this.seed.length - 1; y >= 0; y--) {
            const c = this.seed.charCodeAt(y);
            let t = state[0] ^ c;
            t = (t ^ (t << 11)) >>> 0;
            t = (t ^ (t >> 8)) >>> 0;
            state[0] = state[1];
            state[1] = state[2];
            state[2] = state[3];
            state[3] = (state[3] ^ (state[3] >> 19) ^ t) >>> 0;
            rv = ((rv ^ (c << 24)) * 3427) ^ state[3];
        }
        this.hrCache[seed] = rv >>> 0;
        return this.hrCache[seed];
    }
    //Returns a double between the specified minimum and maximum, from the stream.
    sd(min, max) {
        return (((this.sr() * 4294967296 + this.sr()) / 18446744073709551616) *
            (max - min) +
            min);
    }
    //Returns an integer between the specified minimum and maximum, from the stream.
    si(min, max) {
        return Math.floor(this.sd(min, max + 1));
    }
    //Returns a boolean with the specified chance of bein true (and false otherwise), from the stream
    sb(chance) {
        return this.sd(0, 1) < chance;
    }
    //Returns a double between the specified minimum and maximum, by hashing this object's seed with the specified string.
    hd(min, max, seed) {
        return (((this.hr(seed) * 4294967296 + this.hr(seed + "@")) /
            18446744073709551616) *
            (max - min) +
            min);
    }
    //Returns an integer between the specified minimum and maximum, by hashing this object's seed with the specified string.
    hi(min, max, s) {
        return Math.floor(this.hd(min, max + 1, s));
    }
    //Returns a boolean with the specified chance of being true (and false otherwise), by hashing this object's seed with the specified string.
    hb(chance, seed) {
        return (this.hd(0, 1, seed) < chance);
    }
    //Returns an integer with the specified chance of being -1 (and 1 otherwise), from the stream.
    ss(chance) {
        return this.sb(chance)
            ? -1
            : 1;
    }
    //Returns an integer with the specified chance of being -1 (and 1 otherwise), by hashing this object's seed with the specified string.
    /*
    hs(chance: number, seed: string): number {
      return (this.hr(seed) * 4294967296 +
        this.hr(seed + "@")) /
        18446744073709551616 <
        chance
        ? -1
        : 1;
    }
    */
    //Returns an integer {0,1,2,...}, starting from 0, with the specified chance of advancing to each successive integer, from the stream.
    sseq(chance, max) {
        let rv = 0;
        while (this.sb(chance) &&
            rv < max) {
            rv++;
        }
        return rv;
    }
    //Returns an integer {0,1,2,...}, starting from 0, with the specified chance of advancing to each successive integer, by hashing this object's seed with the specified string.
    hseq(chance, max, seed) {
        let rv = 0;
        while ((this.hr(seed + rv) * 4294967296 + this.hr(seed + "@" + rv)) /
            18446744073709551616 <
            chance &&
            rv < max) {
            rv++;
        }
        return rv;
    }
    //Returns an index of the array chances with the relative probability equal to that element of chances, based on a stream value.
    schoose(chances) {
        let sum = 0;
        for (let i = 0; i < chances.length; i++) {
            sum += chances[i];
        }
        let which = this.sd(0, sum);
        for (let j = 0; j < chances.length; j++) {
            which -= chances[j];
            if (which < 0) {
                return j;
            }
        }
        return 0;
    }
    // Returns an index of the array chances with the relative probability equal to that element of chances, based on a hash value with the specified seed.
    hchoose(chances, seed) {
        let sum = 0;
        for (let i = 0; i < chances.length; i++) {
            sum += chances[i];
        }
        let which = this.hd(0, sum, seed);
        for (let j = 0; j < chances.length; j++) {
            which -= chances[j];
            if (which < 0) {
                return j;
            }
        }
        return 0;
    }
}

// CONCATENATED MODULE: ./src/constants.ts
//Size of the component grid
const COMPONENT_GRID_SIZE = 6;
//Minimum distance between the edge of the ship outline and the edge of the canvas
const CANVAS_SHIP_EDGE = 0;
//Base maximum extent of a component from its origin point. Should be at least equal to cgridsize, but no greater than csedge.
const COMPONENT_MAXIMUM_SIZE = 8;

// CONCATENATED MODULE: ./src/utils.ts
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
function colorChannelToHex(n) {
    //For integer n and length l.
    const s = Math.floor(clamp(n, 0, 1) * 255).toString(16);
    return (s.length < 2) ? "0" + s : s;
}
function colorToHex(color) {
    return "#" +
        colorChannelToHex(color[0]) +
        colorChannelToHex(color[1]) +
        colorChannelToHex(color[2]);
}
// Take a color and multiplies it with a factor. factor = 0 produces black.
function scaleColorBy(color, factor) {
    return colorToHex([color[0] * factor, color[1] * factor, color[2] * factor]);
}
// Takes a triplet [H,S,V] and returns a triplet [R,G,B], representing the same color. All components are 0 - 1.
function hsvToRgb(hsv) {
    const c = hsv[1] * hsv[2];
    const m = hsv[2] - c;
    const h = ((hsv[0] % 1) + 1) % 1;
    const hrel = 6 * h;
    const hseg = Math.floor(hrel);
    const x = c * (1 - Math.abs((hrel % 2) - 1));
    switch (hseg) {
        case 0:
            return [c + m, x + m, m];
        case 1:
            return [x + m, c + m, m];
        case 2:
            return [m, c + m, x + m];
        case 3:
            return [m, x + m, c + m];
        case 4:
            return [x + m, m, c + m];
        default:
            return [c + m, m, x + m];
    }
}

// CONCATENATED MODULE: ./src/faction.ts

function computeFactionComponentChances(factionRandomizer) {
    const componentChances = [];
    const dp = 8; // Default maximum power
    // TODO: once we dont need backwards compatibility, we can probably simplify this file; the first argument of sd seems
    // unnecessary
    componentChances[0] =
        0.8 * factionRandomizer.sd(0.001, 1) * (2 ** factionRandomizer.sd(0, dp));
    componentChances[1] =
        0.9 * factionRandomizer.sd(0.01, 1) * (2 ** factionRandomizer.sd(0, dp));
    componentChances[2] =
        1 * factionRandomizer.sd(0.001, 1) * (2 ** factionRandomizer.sd(0, dp));
    componentChances[3] =
        3 * factionRandomizer.sd(0, 1) * (2 ** factionRandomizer.sd(0, dp));
    componentChances[4] =
        0.5 * factionRandomizer.sd(0, 1) * (2 ** factionRandomizer.sd(0, dp));
    componentChances[5] =
        0.05 * factionRandomizer.sd(0, 1) * (2 ** factionRandomizer.sd(0, dp));
    componentChances[6] =
        0.5 * factionRandomizer.sd(0, 1) * (2 ** factionRandomizer.sd(0, dp));
    return componentChances;
}
function computeFactionColors(factionRandomizer) {
    const colors = [];
    const colorChances = [];
    const dp = 6; // Default maximum power
    const baseColorCount = 1 +
        (factionRandomizer.hb(0.7, "base color +1") ? 1 : 0) +
        factionRandomizer.hseq(0.3, 3, "base color count");
    for (let i = 0; i < baseColorCount; i++) {
        const ls = "base color" + i;
        colors.push(hsvToRgb([
            (factionRandomizer.hd(0, 1, ls + "hue") ** 2),
            clamp(factionRandomizer.hd(-0.2, 1, ls + "saturation"), 0, (factionRandomizer.hd(0, 1, ls + "saturation bound") ** 4)),
            clamp(factionRandomizer.hd(0.7, 1.1, ls + "value"), 0, 1),
        ]));
        colorChances.push((2 ** factionRandomizer.hd(0, dp, ls + "chances")));
    }
    return [colors, colorChances];
}
//Where lp is the ship to get the color for
/*
getwindowcolor(lp) {
  if (this.cache["window colors"] == null) {
    const dp = 5; //Default maximum power.
    this.cache["window color count"] =
      1 + (this.r.hb(0.3, "window color +1") ? 1 : 0);
    this.cache["window colors"] = new Array(this.cache["window color count"]);
    this.cache["window color chances"] = new Array(
      this.cache["window color count"]
    );
    for (let i = 0; i < this.cache["window color count"]; i++) {
      const ls = "window color" + i;
      this.cache["window colors"][i] = hsvToRgb([
        this.r.hb(0.6, "window color blues only")
          ? this.r.hd(1 / 3, 3 / 4, "window color blue hue")
          : this.r.hd(0, 1, "window color hue"),
        Math.pow(
          clamp(this.r.hd(-0.2, 1.2, "window color hue"), 0, 1),
          0.5
        ),
        Math.pow(
          clamp(this.r.hd(0.4, 1.3, "window color value"), 0, 1),
          0.5
        ),
      ]);
      this.cache["window color chances"][i] = Math.pow(
        2,
        this.r.hd(0, dp, ls + "chances")
      );
    }
  }
  const rv = this.cache["window colors"][
    lp.r.schoose(this.cache["window color chances"])
  ];
  return rv;
}
*/

// CONCATENATED MODULE: ./src/ship.ts




function buildShip(factionRandomizer, p_seed, size) {
    const componentChances = computeFactionComponentChances(factionRandomizer);
    const [colors, colorChances] = computeFactionColors(factionRandomizer);
    const shipRandomizer = new Randomizer(factionRandomizer.seed + p_seed);
    function computeBaseColor() {
        let rv = colors[shipRandomizer.schoose(colorChances)];
        if (shipRandomizer.sb(factionRandomizer.hd(0, 0.5, "base color shift chance") ** 2)) {
            rv = [rv[0], rv[1], rv[2]];
            rv[0] = clamp(rv[0] +
                (factionRandomizer.hd(0, 0.6, "base color shift range red") ** 2) *
                    clamp(shipRandomizer.sd(-1, 1.2), 0, 1) *
                    clamp(shipRandomizer.ss(0.7) + shipRandomizer.ss(0.7), -1, 1), 0, 1);
            rv[1] = clamp(rv[1] +
                (factionRandomizer.hd(0, 0.6, "base color shift range green") ** 2) *
                    clamp(shipRandomizer.sd(-1, 1.2), 0, 1) *
                    clamp(shipRandomizer.ss(0.7) + shipRandomizer.ss(0.7), -1, 1), 0, 1);
            rv[2] = clamp(rv[2] +
                (factionRandomizer.hd(0, 0.6, "base color shift range blue") ** 2) *
                    clamp(shipRandomizer.sd(-1, 1.2), 0, 1) *
                    clamp(shipRandomizer.ss(0.7) + shipRandomizer.ss(0.7), -1, 1), 0, 1);
        }
        return rv;
    }
    //The initial overall size of this ship, in pixels
    size =
        size == null
            ? shipRandomizer.sd(factionRandomizer.hd(2.5, 3.5, "size min"), factionRandomizer.hd(5, 7, "size max")) ** 3
            : size;
    const wratio = shipRandomizer.sd(factionRandomizer.hd(0.5, 1, "wratio min"), factionRandomizer.hd(1, 1.3, "wratio max"));
    const hratio = shipRandomizer.sd(factionRandomizer.hd(0.7, 1, "hratio min"), factionRandomizer.hd(1.1, 1.7, "hratio max"));
    const w = Math.floor(size * wratio) + 2 * CANVAS_SHIP_EDGE; // Maximum width of this ship, in pixels
    const hw = Math.floor(w / 2);
    const gw = Math.floor((w - 2 * CANVAS_SHIP_EDGE) / COMPONENT_GRID_SIZE);
    const gwextra = (w - gw * COMPONENT_GRID_SIZE) * 0.5;
    const h = Math.floor(size * hratio) + 2 * CANVAS_SHIP_EDGE; // Maximum height of this ship, in pixels
    const hh = Math.floor(h / 2);
    const gh = Math.floor((h - 2 * CANVAS_SHIP_EDGE) / COMPONENT_GRID_SIZE);
    const ghextra = (h - gh * COMPONENT_GRID_SIZE) * 0.5;
    const cs = document.createElement("canvas"); // Canvas on which the basic outline of the ship is drawn. Ships face upwards, with front towards Y=0
    cs.width = w;
    cs.height = h;
    const csx = cs.getContext("2d");
    // ------ Define outlines ---------------------------------------
    const outlines = [
        // 0: Joined rectangles.
        function () {
            const csarea = (w - 2 * CANVAS_SHIP_EDGE) * (h - 2 * CANVAS_SHIP_EDGE);
            const csarealimit = csarea * 0.05;
            const initialWidth = Math.ceil((w - 2 * CANVAS_SHIP_EDGE) * factionRandomizer.hd(0.1, 1, "outline0 iw") * 0.2);
            const blocks = [
                [
                    [hw - initialWidth, CANVAS_SHIP_EDGE],
                    [hw + initialWidth, h - CANVAS_SHIP_EDGE],
                ],
            ];
            const blockcount = 2 +
                Math.floor(shipRandomizer.sd(0.5, 1) * factionRandomizer.hd(2, 8, "outline0 bc") * Math.sqrt(size));
            for (let i = 1; i < blockcount; i++) {
                const base = blocks[shipRandomizer.si(0, blocks.length - 1)];
                const v0 = [
                    base[0][0] + shipRandomizer.sd(0, 1) * (base[1][0] - base[0][0]),
                    base[0][1] + shipRandomizer.sd(0, 1) * (base[1][1] - base[0][1]),
                ];
                if (v0[1] < (base[0][1] + base[1][1]) * 0.5 &&
                    shipRandomizer.sb(factionRandomizer.hd(0.5, 1.5, "outline0 frontbias"))) {
                    v0[1] = base[1][1] - (v0[1] - base[0][1]);
                }
                const v1 = [
                    clamp(shipRandomizer.sd(0, 1) * w, CANVAS_SHIP_EDGE, w - CANVAS_SHIP_EDGE),
                    clamp(shipRandomizer.sd(0, 1) * h, CANVAS_SHIP_EDGE, h - CANVAS_SHIP_EDGE),
                ];
                const area = Math.abs((v1[0] - v0[0]) * (v1[1] - v0[1]));
                const ratio = csarealimit / area;
                if (ratio < 1) {
                    v1[0] = v0[0] + (v1[0] - v0[0]) * ratio;
                    v1[1] = v0[1] + (v1[1] - v0[1]) * ratio;
                }
                if (v0[0] > v1[0]) {
                    const t = v0[0];
                    v0[0] = v1[0];
                    v1[0] = t;
                }
                if (v0[1] > v1[1]) {
                    const t = v0[1];
                    v0[1] = v1[1];
                    v1[1] = t;
                }
                blocks.push([
                    [Math.floor(v0[0]), Math.floor(v0[1])],
                    [Math.ceil(v1[0]), Math.ceil(v1[1])],
                ]);
            }
            csx.fillStyle = "#fff";
            for (let i = 0; i < blocks.length; i++) {
                const lb = blocks[i];
                csx.fillRect(lb[0][0], lb[0][1], lb[1][0] - lb[0][0], lb[1][1] - lb[0][1]);
                csx.fillRect(w - lb[1][0], lb[0][1], lb[1][0] - lb[0][0], lb[1][1] - lb[0][1]);
            }
        },
        // 1: Joined circles
        function () {
            const csarea = (w - 2 * CANVAS_SHIP_EDGE) * (h - 2 * CANVAS_SHIP_EDGE);
            const csarealimit = csarea * 0.05;
            const csrlimit = Math.max(2, Math.sqrt(csarealimit / Math.PI));
            const initialwidth = Math.ceil((w - 2 * CANVAS_SHIP_EDGE) * factionRandomizer.hd(0.1, 1, "outline1 iw") * 0.2);
            const circles = [];
            const initialcount = Math.floor((h - 2 * CANVAS_SHIP_EDGE) / (initialwidth * 2));
            for (let i = 0; i < initialcount; i++) {
                let lv = [hw, h - (CANVAS_SHIP_EDGE + initialwidth * (i * 2 + 1))];
                circles.push({ v: lv, r: initialwidth });
            }
            const circlecount = initialcount +
                Math.floor(shipRandomizer.sd(0.5, 1) * factionRandomizer.hd(10, 50, "outline1 cc") * Math.sqrt(size));
            for (let i = initialcount; i < circlecount; i++) {
                const base = circles[Math.max(shipRandomizer.si(0, circles.length - 1), shipRandomizer.si(0, circles.length - 1))];
                let ncr = shipRandomizer.sd(1, csrlimit);
                const pr = shipRandomizer.sd(Math.max(0, base.r - ncr), base.r);
                let pa = shipRandomizer.sd(0, 2 * Math.PI);
                if (pa > Math.PI && shipRandomizer.sb(factionRandomizer.hd(0.5, 1.5, "outline1 frontbias"))) {
                    pa = shipRandomizer.sd(0, Math.PI);
                }
                let lv = [base.v[0] + Math.cos(pa) * pr, base.v[1] + Math.sin(pa) * pr];
                ncr = Math.min(ncr, lv[0] - CANVAS_SHIP_EDGE, w - CANVAS_SHIP_EDGE - lv[0], lv[1] - CANVAS_SHIP_EDGE, h - CANVAS_SHIP_EDGE - lv[1]);
                circles.push({ v: lv, r: ncr });
            }
            csx.fillStyle = "#fff";
            for (let i = 0; i < circles.length; i++) {
                const lc = circles[i];
                csx.beginPath();
                csx.arc(lc.v[0], lc.v[1], lc.r, 0, 2 * Math.PI);
                csx.fill();
                csx.beginPath();
                csx.arc(w - lc.v[0], lc.v[1], lc.r, 0, 2 * Math.PI);
                csx.fill();
            }
        },
        // 2: Mess of lines
        function () {
            const innersize = [w - 2 * CANVAS_SHIP_EDGE, h - 2 * CANVAS_SHIP_EDGE];
            const points = [
                [hw, shipRandomizer.sd(0, 0.05) * innersize[1] + CANVAS_SHIP_EDGE],
                [hw, shipRandomizer.sd(0.95, 1) * innersize[1] + CANVAS_SHIP_EDGE],
            ];
            const basefatness = COMPONENT_GRID_SIZE / size +
                factionRandomizer.hd(0.03, 0.1, "outline2 basefatness");
            const basemessiness = 1 / basefatness;
            const pointcount = Math.max(3, Math.ceil(basemessiness * shipRandomizer.sd(0.05, 0.1) * Math.sqrt(size)));
            // @ts-ignore - We're doing it properly
            csx.lineCap = ["round", "square"][factionRandomizer.hi(0, 1, "outline2 linecap")];
            csx.strokeStyle = "#fff";
            for (let npi = 1; npi < pointcount; npi++) {
                let np = points[npi];
                if (np == null) {
                    np = [
                        shipRandomizer.sd(0, 1) * innersize[0] + CANVAS_SHIP_EDGE,
                        (shipRandomizer.sd(0, 1) ** factionRandomizer.hd(0.1, 1, "outline2 frontbias")) *
                            innersize[1] +
                            CANVAS_SHIP_EDGE,
                    ];
                    points.push(np);
                }
                const cons = 1 + shipRandomizer.sseq(factionRandomizer.hd(0, 1, "outline2 conadjust"), 3);
                for (let nci = 0; nci < cons; nci++) {
                    const pre = points[shipRandomizer.si(0, points.length - 2)];
                    csx.lineWidth = shipRandomizer.sd(0.7, 1) * basefatness * size;
                    csx.beginPath();
                    csx.moveTo(pre[0], pre[1]);
                    csx.lineTo(np[0], np[1]);
                    csx.stroke();
                    csx.beginPath();
                    csx.moveTo(w - pre[0], pre[1]);
                    csx.lineTo(w - np[0], np[1]);
                    csx.stroke();
                }
            }
        }
    ];
    // ------ End define outlines -----------------------------------
    outlines[factionRandomizer.hchoose([1, 1, 1], "outline type")]();
    const outline = csx.getImageData(0, 0, w, h);
    //Returns the alpha value (0 - 255) for the pixel of csd corresponding to the point (X,Y), or -1 if (X,Y) is out of bounds.
    function getOutlineAlpha(x, y) {
        if (x < 0 || x > w || y < 0 || y > h) {
            return -1;
        }
        return outline.data[(y * w + x) * 4 + 3];
    }
    const cgrid = [];
    for (let gx = 0; gx < gw; gx++) {
        cgrid[gx] = [];
        for (let gy = 0; gy < gh; gy++) {
            cgrid[gx][gy] = {
                gx: gx,
                gy: gy,
                x: Math.floor(gwextra + (gx + 0.5) * COMPONENT_GRID_SIZE),
                y: Math.floor(ghextra + (gy + 0.5) * COMPONENT_GRID_SIZE),
                phase: 0,
            }; // Phase is 0 for unchecked, 1 for checked and good, and -1 for checked and bad
        }
    }
    const goodcells = [
        cgrid[Math.floor(gw / 2)][Math.floor(gh / 2)],
    ];
    let nextcheck = 0;
    while (nextcheck < goodcells.length) {
        const lcell = goodcells[nextcheck];
        if (lcell.gx > 0) {
            const ncell = cgrid[lcell.gx - 1][lcell.gy];
            if (ncell.phase == 0) {
                if (getOutlineAlpha(ncell.x, ncell.y) > 0) {
                    ncell.phase = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell.phase = -1;
                }
            }
        }
        if (lcell.gx < gw - 1) {
            const ncell = cgrid[lcell.gx + 1][lcell.gy];
            if (ncell.phase == 0) {
                if (getOutlineAlpha(ncell.x, ncell.y) > 0) {
                    ncell.phase = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell.phase = -1;
                }
            }
        }
        if (lcell.gy > 0) {
            const ncell = cgrid[lcell.gx][lcell.gy - 1];
            if (ncell.phase == 0) {
                if (getOutlineAlpha(ncell.x, ncell.y) > 0) {
                    ncell.phase = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell.phase = -1;
                }
            }
        }
        if (lcell.gy < gh - 1) {
            const ncell = cgrid[lcell.gx][lcell.gy + 1];
            if (ncell.phase == 0) {
                if (getOutlineAlpha(ncell.x, ncell.y) > 0) {
                    ncell.phase = 1;
                    goodcells.push(ncell);
                }
                else {
                    ncell.phase = -1;
                }
            }
        }
        nextcheck++;
    }
    for (let i = 0; i < goodcells.length; i++) {
        const lcell = goodcells[i];
        const ocell = cgrid[gw - 1 - lcell.gx][lcell.gy];
        if (ocell.phase != 1) {
            ocell.phase = 1;
            goodcells.push(ocell);
        }
    }
    const passes = factionRandomizer.hi(1, 2, "base component passes");
    const extra = Math.max(1, Math.floor(goodcells.length *
        factionRandomizer.hd(0, 1 / passes, "extra component amount")));
    const totalcomponents = passes * goodcells.length + extra;
    const cf = document.createElement("canvas"); // Canvas on which the actual ship components are drawn. Ships face upwards, with front towards Y=0
    cf.width = w;
    cf.height = h;
    const cfx = cf.getContext("2d");
    // ------ Define components ---------------------------------------
    //Returns the phase of the cell containing (X,Y), or 0 if there is no such cell
    function getCellPhase(x, y) {
        const gx = Math.floor((x - gwextra) / COMPONENT_GRID_SIZE);
        const gy = Math.floor((y - ghextra) / COMPONENT_GRID_SIZE);
        if (gx < 0 || gx >= gw || gy < 0 || gy >= gh) {
            return 0;
        }
        return cgrid[gx][gy].phase;
    }
    function frontness(v) {
        return 1 - v[1] / h;
    }
    function centerness(v, doY) {
        let rv = Math.min(1, 1 - Math.abs(v[0] - hw) / hw);
        if (doY) {
            rv = Math.min(rv, 1 - Math.abs(v[1] - hh) / hh);
        }
        return rv;
    }
    function bigness(v) {
        const effectCenter = centerness(v, true);
        const effectShipsize = 1 - 1 / ((w + h) / 1000 + 1);
        const effectFaction = factionRandomizer.hd(0, 1, "master bigness") ** 0.5;
        const effectStack = 1 - totaldone / totalcomponents;
        return effectCenter * effectShipsize * effectFaction * effectStack;
    }
    function leeway(v1, v2) {
        return [
            Math.min(v1[0] - CANVAS_SHIP_EDGE, w - CANVAS_SHIP_EDGE - v2[0]),
            Math.min(v1[1] - CANVAS_SHIP_EDGE, h - CANVAS_SHIP_EDGE - v2[1]),
        ];
    }
    //lp is the ship. amount is the amount of shadow at the edges, 0 - 1 (the middle is always 0). middlep and edgep should be vectors at the middle and edge of the gradient.
    function shadowGradient(middlePoint, edgePoint, amount) {
        const grad = cfx.createLinearGradient(edgePoint[0], edgePoint[1], middlePoint[0] * 2 - edgePoint[0], middlePoint[1] * 2 - edgePoint[1]);
        const darkness = `rgba(0,0,0,${clamp(amount, 0, 1)})`;
        grad.addColorStop(0, darkness);
        grad.addColorStop(0.5, "rgba(0,0,0,0)");
        grad.addColorStop(1, darkness);
        return grad;
    }
    // Each component function takes an argument 'lp' (for the ship) and 'v' (an integral 2-vector denoting the center of the component)
    const components = [
        // Bordered block
        function (v) {
            let lcms = COMPONENT_MAXIMUM_SIZE;
            const bn = bigness(v) ** 0.3;
            if (shipRandomizer.sb(factionRandomizer.hd(0, 0.9, "com0 bigchance") * bn)) {
                const chance = factionRandomizer.hd(0, 0.5, "com0 bigincchance");
                while (shipRandomizer.sb(chance * bn)) {
                    const lw = leeway([v[0] - lcms, v[1] - lcms], [v[0] + lcms, v[1] + lcms]);
                    if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                        lcms *= 1.5;
                    }
                    else {
                        break;
                    }
                }
            }
            const lcms2 = lcms * 2;
            const dhi = [
                Math.ceil(shipRandomizer.sd(1, Math.max(2, 0.5 * lcms))),
                Math.ceil(shipRandomizer.sd(1, Math.max(2, 0.5 * lcms))),
            ];
            const borderwidth = Math.min(dhi[0], dhi[1]) * shipRandomizer.sd(0.1, 1.2);
            const dho = [dhi[0] + borderwidth * 2, dhi[1] + borderwidth * 2];
            const counts = [Math.ceil(lcms2 / dho[0]), Math.ceil(lcms2 / dho[1])];
            const trv = [
                Math.round((counts[0] * dho[0]) / 2),
                Math.round((counts[1] * dho[1]) / 2),
            ];
            const baseColor = computeBaseColor();
            const icolorh = scaleColorBy(baseColor, shipRandomizer.sd(0.4, 1));
            const ocolorh = scaleColorBy(baseColor, shipRandomizer.sd(0.4, 1));
            cfx.fillStyle = "rgba(0,0,0," + shipRandomizer.sd(0, 0.25) + ")";
            cfx.fillRect(v[0] - trv[0] - 1, v[1] - trv[1] - 1, dho[0] * counts[0] + 2, dho[1] * counts[1] + 2);
            cfx.fillStyle = ocolorh;
            cfx.fillRect(v[0] - trv[0], v[1] - trv[1], dho[0] * counts[0], dho[1] * counts[1]);
            cfx.fillStyle = icolorh;
            for (let x = 0; x < counts[0]; x++) {
                const bx = v[0] + borderwidth + x * dho[0] - trv[0];
                for (let y = 0; y < counts[1]; y++) {
                    const by = v[1] + borderwidth + y * dho[1] - trv[1];
                    cfx.fillRect(bx, by, dhi[0], dhi[1]);
                }
            }
            if (shipRandomizer.sb(clamp((totaldone * 0.6 / totalcomponents + 0.3) * (lcms / COMPONENT_MAXIMUM_SIZE), 0, 0.98))) {
                cfx.fillStyle = shadowGradient(v, [v[0] + trv[0], v[1]], shipRandomizer.sd(0, 0.9));
                cfx.fillRect(v[0] - trv[0], v[1] - trv[1], dho[0] * counts[0], dho[1] * counts[1]);
            }
        },
        // Cylinder array
        function (v) {
            let lcms = COMPONENT_MAXIMUM_SIZE;
            const bn = bigness(v) ** 0.2;
            if (shipRandomizer.sb(factionRandomizer.hd(0.3, 1, "com1 bigchance") * bn)) {
                const chance = factionRandomizer.hd(0, 0.6, "com1 bigincchance");
                while (shipRandomizer.sb(chance * bn)) {
                    const lw = leeway([v[0] - lcms, v[1] - lcms], [v[0] + lcms, v[1] + lcms]);
                    if (Math.min(lw[0], lw[1]) > lcms / 2) {
                        lcms *= 1.5;
                    }
                    else {
                        break;
                    }
                }
            }
            let componentWidth = Math.ceil(shipRandomizer.sd(0.8, 2) * lcms);
            const componentHeight = Math.ceil(shipRandomizer.sd(0.8, 2) * lcms);
            const cw = shipRandomizer.si(3, Math.max(4, componentWidth));
            const count = Math.max(1, Math.round(componentWidth / cw));
            componentWidth = count * cw;
            const baseColor = computeBaseColor();
            const ccolor = scaleColorBy(baseColor, shipRandomizer.sd(0.5, 1));
            const darkness = shipRandomizer.sd(0.3, 0.9);
            // true = horizontal array, false = vertical array
            const orientation = shipRandomizer.sb(clamp(factionRandomizer.hd(-0.2, 1.2, "com1 hchance"), 0, 1));
            if (orientation) {
                const bv = [v[0] - Math.floor(componentWidth / 2), v[1] - Math.floor(componentHeight / 2)];
                cfx.fillStyle = "rgba(0,0,0," + shipRandomizer.sd(0, 0.25) + ")";
                cfx.fillRect(bv[0] - 1, bv[1] - 1, componentWidth + 2, componentHeight + 2);
                cfx.fillStyle = ccolor;
                cfx.fillRect(bv[0], bv[1], componentWidth, componentHeight);
                for (let i = 0; i < count; i++) {
                    cfx.fillStyle = shadowGradient([bv[0] + (i + 0.5) * cw, v[1]], [bv[0] + i * cw, v[1]], darkness);
                    cfx.fillRect(bv[0] + i * cw, bv[1], cw, componentHeight);
                }
            }
            else {
                const bv = [v[0] - Math.floor(componentHeight / 2), v[1] - Math.floor(componentWidth / 2)];
                cfx.fillStyle = "rgba(0,0,0," + shipRandomizer.sd(0, 0.25) + ")";
                cfx.fillRect(bv[0] - 1, bv[1] - 1, componentHeight + 2, componentWidth + 2);
                cfx.fillStyle = ccolor;
                cfx.fillRect(bv[0], bv[1], componentHeight, componentWidth);
                for (let i = 0; i < count; i++) {
                    cfx.fillStyle = shadowGradient([v[0], bv[1] + (i + 0.5) * cw], [v[0], bv[1] + i * cw], darkness);
                    cfx.fillRect(bv[0], bv[1] + i * cw, componentWidth, cw);
                }
            }
        },
        // Banded cylinder
        function (v) {
            let lcms = COMPONENT_MAXIMUM_SIZE;
            const bn = bigness(v) ** 0.05;
            if (shipRandomizer.sb(factionRandomizer.hd(0, 1, "com2 bigchance") * bn)) {
                const chance = factionRandomizer.hd(0, 0.9, "com2 bigincchance");
                while (shipRandomizer.sb(chance * bn)) {
                    const lw = leeway([v[0] - lcms, v[1] - lcms], [v[0] + lcms, v[1] + lcms]);
                    if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                        lcms *= 1.5;
                    }
                    else {
                        break;
                    }
                }
            }
            const componentWidth = Math.ceil(shipRandomizer.sd(0.6, 1.4) * lcms);
            const componentHeight = Math.ceil(shipRandomizer.sd(1, 2) * lcms);
            const wh2 = [
                Math.ceil(clamp((componentWidth * shipRandomizer.sd(0.7, 1)) / 2, 1, componentWidth)),
                Math.ceil(clamp((componentWidth * shipRandomizer.sd(0.8, 1)) / 2, 1, componentWidth)),
            ];
            const h2 = [
                Math.floor(clamp(componentWidth * shipRandomizer.sd(0.05, 0.25), 1, componentHeight)),
                Math.floor(clamp(componentWidth * shipRandomizer.sd(0.1, 0.3), 1, componentHeight)),
            ];
            const hpair = h2[0] + h2[1];
            const odd = shipRandomizer.sb(factionRandomizer.hd(0, 1, "com2 oddchance") ** 0.5);
            const count = clamp(Math.floor(componentHeight / hpair), 1, componentHeight);
            const htotal = count * hpair + (odd ? h2[0] : 0);
            const baseColor = computeBaseColor();
            const scale_0 = shipRandomizer.sd(0.6, 1);
            const scale_1 = shipRandomizer.sd(0.6, 1);
            const color2 = [
                scaleColorBy(baseColor, scale_0),
                scaleColorBy(baseColor, scale_1),
            ];
            const lightness = 1 - shipRandomizer.sd(0.5, 0.95);
            const colord2 = [
                scaleColorBy(baseColor, lightness * scale_0),
                scaleColorBy(baseColor, lightness * scale_1),
            ];
            const orientation = shipRandomizer.sb(factionRandomizer.hd(0, 1, "com2 verticalchance") ** 0.1);
            if (orientation) {
                const grad2_0 = cfx.createLinearGradient(v[0] - wh2[0], v[1], v[0] + wh2[0], v[1]);
                const grad2_1 = cfx.createLinearGradient(v[0] - wh2[1], v[1], v[0] + wh2[1], v[1]);
                grad2_0.addColorStop(0, colord2[0]);
                grad2_0.addColorStop(0.5, color2[0]);
                grad2_0.addColorStop(1, colord2[0]);
                grad2_1.addColorStop(0, colord2[1]);
                grad2_1.addColorStop(0.5, color2[1]);
                grad2_1.addColorStop(1, colord2[1]);
                const by = Math.floor(v[1] - htotal / 2);
                for (let i = 0; i < count; i++) {
                    cfx.fillStyle = grad2_0;
                    cfx.fillRect(v[0] - wh2[0], by + i * hpair, wh2[0] * 2, h2[0]);
                    cfx.fillStyle = grad2_1;
                    cfx.fillRect(v[0] - wh2[1], by + i * hpair + h2[0], wh2[1] * 2, h2[1]);
                }
                if (odd) {
                    cfx.fillStyle = grad2_0;
                    cfx.fillRect(v[0] - wh2[0], by + count * hpair, wh2[0] * 2, h2[0]);
                }
            }
            else {
                const grad2_0 = cfx.createLinearGradient(v[0], v[1] - wh2[0], v[0], v[1] + wh2[0]);
                const grad2_1 = cfx.createLinearGradient(v[0], v[1] - wh2[1], v[0], v[1] + wh2[1]);
                grad2_0.addColorStop(0, colord2[0]);
                grad2_0.addColorStop(0.5, color2[0]);
                grad2_0.addColorStop(1, colord2[0]);
                grad2_1.addColorStop(0, colord2[1]);
                grad2_1.addColorStop(0.5, color2[1]);
                grad2_1.addColorStop(1, colord2[1]);
                const bx = Math.floor(v[0] - htotal / 2);
                for (let i = 0; i < count; i++) {
                    cfx.fillStyle = grad2_0;
                    cfx.fillRect(bx + i * hpair, v[1] - wh2[0], h2[0], wh2[0] * 2);
                    cfx.fillStyle = grad2_1;
                    cfx.fillRect(bx + i * hpair + h2[0], v[1] - wh2[1], h2[1], wh2[1] * 2);
                }
                if (odd) {
                    cfx.fillStyle = grad2_0;
                    cfx.fillRect(bx + count * hpair, v[1] - wh2[0], h2[0], wh2[0] * 2);
                }
            }
        },
        //Rocket engine (or tries to call another random component if too far forward)
        function (v) {
            if (shipRandomizer.sb(frontness(v) - 0.3) ||
                getCellPhase(v[0], v[1] + COMPONENT_GRID_SIZE * 1.2) > 0 ||
                getCellPhase(v[0], v[1] + COMPONENT_GRID_SIZE * 1.8) > 0) {
                for (let tries = 0; tries < 100; tries++) {
                    const which = shipRandomizer.schoose(componentChances);
                    if (which != 3) {
                        components[which](v);
                        return;
                    }
                }
            }
            let lcms = COMPONENT_MAXIMUM_SIZE;
            const bn = bigness(v) ** 0.1;
            if (shipRandomizer.sb(factionRandomizer.hd(0.6, 1, "com3 bigchance") * bn)) {
                const chance = factionRandomizer.hd(0.3, 0.8, "com3 bigincchance");
                while (shipRandomizer.sb(chance * bn)) {
                    const lw = leeway([v[0] - lcms, v[1] - lcms], [v[0] + lcms, v[1] + lcms]);
                    if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                        lcms *= 1.5;
                    }
                    else {
                        break;
                    }
                }
            }
            const componentWidth = shipRandomizer.sd(1, 2) * lcms;
            let componentHeight = Math.ceil(shipRandomizer.sd(0.3, 1) * lcms);
            const nratio = shipRandomizer.sd(0.25, 0.6);
            const nw = componentWidth * nratio;
            const midw = (componentWidth + nw) / 2;
            const midwh = midw / 2;
            const componentHeight2 = [
                Math.max(1, Math.ceil(componentHeight * shipRandomizer.sd(0.08, 0.25))),
                Math.max(1, Math.ceil(componentHeight * shipRandomizer.sd(0.03, 0.15))),
            ];
            const hpair = componentHeight2[0] + componentHeight2[1];
            const count = Math.ceil(componentHeight / hpair);
            componentHeight = count * hpair + componentHeight2[0];
            const basecolor = colors[factionRandomizer.hchoose(colorChances, "com3 basecolor")];
            const lightness0_mid = factionRandomizer.hd(0.5, 0.8, "com3 lightness0 mid");
            const lightness0_edge = lightness0_mid - factionRandomizer.hd(0.2, 0.4, "com3 lightness0 edge");
            const lightness1_edge = factionRandomizer.hd(0, 0.2, "com3 lightness1 edge");
            const grad2 = [
                cfx.createLinearGradient(v[0] - midwh, v[1], v[0] + midwh, v[1]),
                cfx.createLinearGradient(v[0] - midwh, v[1], v[0] + midwh, v[1]),
            ];
            grad2[0].addColorStop(0, scaleColorBy(basecolor, lightness0_edge));
            grad2[0].addColorStop(0.5, scaleColorBy(basecolor, lightness0_mid));
            grad2[0].addColorStop(1, scaleColorBy(basecolor, lightness0_edge));
            grad2[1].addColorStop(0, scaleColorBy(basecolor, lightness1_edge));
            grad2[1].addColorStop(0.5, colorToHex(basecolor));
            grad2[1].addColorStop(1, scaleColorBy(basecolor, lightness1_edge));
            const by = Math.ceil(v[1] - componentHeight / 2);
            cfx.fillStyle = grad2[0];
            cfx.beginPath();
            cfx.moveTo(v[0] - nw / 2, by);
            cfx.lineTo(v[0] + nw / 2, by);
            cfx.lineTo(v[0] + componentWidth / 2, by + componentHeight);
            cfx.lineTo(v[0] - componentWidth / 2, by + componentHeight);
            cfx.fill();
            cfx.fillStyle = grad2[1];
            const byh = [by + componentHeight2[0], by + hpair];
            for (let i = 0; i < count; i++) {
                const lyr = [i * hpair + componentHeight2[0], (i + 1) * hpair];
                const ly = [byh[0] + i * hpair, byh[1] + i * hpair];
                const lw = [
                    (nw + (componentWidth - nw) * (lyr[0] / componentHeight)) / 2,
                    (nw + (componentWidth - nw) * (lyr[1] / componentHeight)) / 2,
                ];
                cfx.beginPath();
                cfx.moveTo(v[0] - lw[0], ly[0]);
                cfx.lineTo(v[0] + lw[0], ly[0]);
                cfx.lineTo(v[0] + lw[1], ly[1]);
                cfx.lineTo(v[0] - lw[1], ly[1]);
                cfx.fill();
            }
        },
        //Elongated cylinder (calls component 0 - 2 on top of its starting point)
        function (v) {
            const cn = centerness(v, false);
            const lightmid = shipRandomizer.sd(0.7, 1);
            const lightedge = shipRandomizer.sd(0, 0.2);
            const baseColor = computeBaseColor();
            const colormid = scaleColorBy(baseColor, lightmid);
            const coloredge = scaleColorBy(baseColor, lightedge);
            const componentWidth = Math.max(3, Math.ceil(size *
                (shipRandomizer.sd(0.4, 1) ** 2) *
                factionRandomizer.hd(0.02, 0.1, "com4 maxwidth")));
            const hwi = Math.floor(componentWidth / 2);
            const hwe = componentWidth % 2;
            const forwards = 1 * (factionRandomizer.hd(0, 1, "com4 directionc0") ** 4);
            const backwards = 0.1 * (factionRandomizer.hd(0, 1, "com4 directionc1") ** 4);
            const toCenter = 0.2 * (factionRandomizer.hd(0, 1, "com4 directionc2") ** 4);
            const direction = shipRandomizer.schoose([
                forwards * (2 - cn),
                backwards,
                toCenter * (1 + cn),
            ]);
            let ev = null;
            // Shorter than comparing with 0
            if (!direction) {
                //forwards
                const hlimit = v[1] - CANVAS_SHIP_EDGE;
                const componentHeight = Math.min(Math.max(COMPONENT_MAXIMUM_SIZE, hlimit - shipRandomizer.si(0, COMPONENT_MAXIMUM_SIZE * 2)), Math.floor(0.7 * size * (shipRandomizer.sd(0, 1) ** factionRandomizer.hd(2, 6, "com4 hpower0"))));
                const bb_0_0 = v[0] - hwi, bb_0_1 = v[1] - componentHeight, bb_1_0 = v[0] + hwi + hwe;
                const grad = cfx.createLinearGradient(bb_0_0, bb_0_1, bb_1_0, bb_0_1);
                grad.addColorStop(0, coloredge);
                grad.addColorStop(0.5, colormid);
                grad.addColorStop(1, coloredge);
                cfx.fillStyle = grad;
                cfx.fillRect(bb_0_0, bb_0_1, componentWidth, componentHeight);
                ev = [v[0], v[1] - componentHeight];
            }
            else if (direction == 1) {
                //backwards
                const hlimit = h - (CANVAS_SHIP_EDGE + v[1]);
                const componentHeight = Math.min(Math.max(COMPONENT_MAXIMUM_SIZE, hlimit - shipRandomizer.si(0, COMPONENT_MAXIMUM_SIZE * 2)), Math.floor(0.6 * size * (shipRandomizer.sd(0, 1) ** factionRandomizer.hd(2, 7, "com4 hpower1"))));
                const bb_0_0 = v[0] - hwi, bb_0_1 = v[1], bb_1_0 = v[0] + hwi + hwe;
                const grad = cfx.createLinearGradient(bb_0_0, bb_0_1, bb_1_0, bb_0_1);
                grad.addColorStop(0, coloredge);
                grad.addColorStop(0.5, colormid);
                grad.addColorStop(1, coloredge);
                cfx.fillStyle = grad;
                cfx.fillRect(bb_0_0, bb_0_1, componentWidth, componentHeight);
                ev = [v[0], v[1] + componentHeight];
            }
            else if (direction == 2) {
                //to center
                const grad = cfx.createLinearGradient(v[0], v[1] - hwi, v[0], v[1] + hwi + hwe);
                grad.addColorStop(0, coloredge);
                grad.addColorStop(0.5, colormid);
                grad.addColorStop(1, coloredge);
                cfx.fillStyle = grad;
                cfx.fillRect(v[0], v[1] - hwi, Math.ceil(hw - v[0]) + 1, componentWidth);
                ev = [hw, v[1]];
            }
            const coverComC = [
                0.6 * (factionRandomizer.hd(0, 1, "com4 covercomc0") ** 2),
                0.2 * (factionRandomizer.hd(0, 1, "com4 covercomc1") ** 2),
                (factionRandomizer.hd(0, 1, "com4 covercomc2") ** 2),
            ];
            components[shipRandomizer.schoose(coverComC)](v);
            if (getCellPhase(ev[0], ev[1]) > 0) {
                const nev = [
                    ev[0] + Math.round(shipRandomizer.sd(-1, 1) * COMPONENT_GRID_SIZE),
                    ev[1] + Math.round(shipRandomizer.sd(-1, 1) * COMPONENT_GRID_SIZE),
                ];
                if (getCellPhase(nev[0], nev[1]) > 0) {
                    components[shipRandomizer.schoose(coverComC)](nev);
                }
                else {
                    components[shipRandomizer.schoose(coverComC)](ev);
                }
            }
        },
        //Ball
        function (v) {
            let lcms = COMPONENT_MAXIMUM_SIZE;
            const bn = bigness(v) ** 0.1;
            if (shipRandomizer.sb(factionRandomizer.hd(0, 0.9, "com5 bigchance") * bn)) {
                const chance = factionRandomizer.hd(0, 0.8, "com5 bigincchance");
                while (shipRandomizer.sb(chance * bn)) {
                    const lw = leeway([v[0] - lcms, v[1] - lcms], [v[0] + lcms, v[1] + lcms]);
                    if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                        lcms *= 1.5;
                    }
                    else {
                        break;
                    }
                }
            }
            const lightmid = shipRandomizer.sd(0.75, 1);
            const lightedge = shipRandomizer.sd(0, 0.25);
            const baseColor = computeBaseColor();
            const colormid = scaleColorBy(baseColor, lightmid);
            const coloredge = scaleColorBy(baseColor, lightedge);
            const countx = 1 +
                shipRandomizer.sseq(factionRandomizer.hd(0, 1, "com5 multxc"), Math.floor(1.2 * ((lcms / COMPONENT_MAXIMUM_SIZE) ** 0.6)));
            const county = 1 +
                shipRandomizer.sseq(factionRandomizer.hd(0, 1, "com5 multyc"), Math.floor(1.2 * ((lcms / COMPONENT_MAXIMUM_SIZE) ** 0.6)));
            const smallr = (shipRandomizer.sd(0.5, 1) * lcms) / Math.max(countx, county);
            const drawr = smallr + 0.5;
            const shadowr = smallr + 1;
            const centerr = smallr * 0.2;
            const componentHw = smallr * countx;
            const componentHh = smallr * county;
            const bv = [v[0] - componentHw, v[1] - componentHh];
            cfx.fillStyle = "rgba(0,0,0," + shipRandomizer.sd(0, 0.2) + ")";
            for (let ax = 0; ax < countx; ax++) {
                const px = bv[0] + (ax * 2 + 1) * smallr;
                for (let ay = 0; ay < county; ay++) {
                    const py = bv[1] + (ay * 2 + 1) * smallr;
                    cfx.beginPath();
                    cfx.arc(px, py, shadowr, 0, 2 * Math.PI);
                    cfx.fill();
                }
            }
            for (let ax = 0; ax < countx; ax++) {
                const px = bv[0] + (ax * 2 + 1) * smallr;
                for (let ay = 0; ay < county; ay++) {
                    const py = bv[1] + (ay * 2 + 1) * smallr;
                    const grad = cfx.createRadialGradient(px, py, centerr, px, py, drawr);
                    grad.addColorStop(0, colormid);
                    grad.addColorStop(1, coloredge);
                    cfx.fillStyle = grad;
                    cfx.beginPath();
                    cfx.arc(px, py, drawr, 0, 2 * Math.PI);
                    cfx.fill();
                }
            }
        },
        //Forward-facing trapezoidal fin
        function (v) {
            if (nextpass <= 0 || shipRandomizer.sb(frontness(v))) {
                components[shipRandomizer.schoose(componentChances.slice(0, 6))](v);
                return;
            }
            let lcms = COMPONENT_MAXIMUM_SIZE;
            const bn = bigness(v) ** 0.05;
            if (shipRandomizer.sb(factionRandomizer.hd(0, 0.9, "com6 bigchance") * bn)) {
                const chance = factionRandomizer.hd(0, 0.8, "com6 bigincchance");
                while (shipRandomizer.sb(chance * bn)) {
                    const lw = leeway([v[0] - lcms, v[1] - lcms], [v[0] + lcms, v[1] + lcms]);
                    if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                        lcms *= 1.5;
                    }
                    else {
                        break;
                    }
                }
            }
            const h0 = Math.ceil(lcms * 2 * shipRandomizer.sd(0.6, 1)); //Inner height, longer.
            const hh0i = Math.floor(h0 / 2);
            const hh0e = h0 % 2;
            //Outer height, shorter
            const h1 = h0 *
                (shipRandomizer.sd(factionRandomizer.hd(0, 0.8, "com6 h1min") ** 0.5, 0.9) **
                    factionRandomizer.hd(0.5, 1.5, "com6 h1power"));
            const hh1i = Math.floor(h1 / 2);
            const hh1e = h0 % 2;
            const backamount = Math.max(0 - (h0 - h1) / 2, h0 *
                (shipRandomizer.sd(0, 0.45) + shipRandomizer.sd(0, 0.45)) *
                (factionRandomizer.hb(0.8, "com6 backnesstype")
                    ? factionRandomizer.hd(0.2, 0.9, "com6 backness#pos")
                    : factionRandomizer.hd(-0.2, -0.05, "com6 backness#neg")));
            const componentWidth = Math.ceil(lcms * shipRandomizer.sd(0.7, 1) * (factionRandomizer.hd(0.1, 3.5, "com6 width") ** 0.5));
            const hwi = Math.floor(componentWidth / 2);
            const hwe = componentWidth % 2;
            const quad = [
                [v[0] - hwi, v[1] + backamount - hh1i],
                [v[0] + hwi + hwe, v[1] - hh0i],
                [v[0] + hwi + hwe, v[1] + hh0i + hh0e],
                [v[0] - hwi, v[1] + backamount + hh1i + hh1e],
            ];
            const baseColor = computeBaseColor();
            cfx.fillStyle = "rgba(0,0,0," + shipRandomizer.sd(0, 0.2) + ")";
            cfx.beginPath();
            cfx.moveTo(quad[0][0] - 1, quad[0][1]);
            cfx.lineTo(quad[1][0] - 1, quad[1][1]);
            cfx.lineTo(quad[2][0] - 1, quad[2][1]);
            cfx.lineTo(quad[3][0] - 1, quad[3][1]);
            cfx.fill();
            cfx.fillStyle = scaleColorBy(baseColor, shipRandomizer.sd(0.7, 1));
            cfx.beginPath();
            cfx.moveTo(quad[0][0], quad[0][1]);
            cfx.lineTo(quad[1][0], quad[1][1]);
            cfx.lineTo(quad[2][0], quad[2][1]);
            cfx.lineTo(quad[3][0], quad[3][1]);
            cfx.fill();
        }
    ];
    // ------ End define outlines -----------------------------------
    // Add components
    let extradone = 0, nextpass = 0, nextcell = 0, totaldone = 0;
    for (;;) {
        let ncell;
        if (nextpass < passes) {
            if (nextcell < goodcells.length) {
                ncell = goodcells[nextcell];
                nextcell++;
            }
            else {
                nextpass++;
                ncell = goodcells[0];
                nextcell = 1;
            }
        }
        else if (extradone < extra) {
            ncell = goodcells[shipRandomizer.si(0, goodcells.length - 1)];
            extradone++;
        }
        else {
            break;
        }
        let lv = [ncell.x, ncell.y];
        for (let t = 0; t < 10; t++) {
            const nv = [
                ncell.x + shipRandomizer.si(-COMPONENT_GRID_SIZE, COMPONENT_GRID_SIZE),
                ncell.y + shipRandomizer.si(-COMPONENT_GRID_SIZE, COMPONENT_GRID_SIZE),
            ];
            if (nv[0] < CANVAS_SHIP_EDGE ||
                nv[0] > w - CANVAS_SHIP_EDGE ||
                nv[1] < CANVAS_SHIP_EDGE ||
                nv[1] > h - CANVAS_SHIP_EDGE) {
                continue;
            }
            if (getOutlineAlpha(nv[0], nv[1]) <= 0) {
                continue;
            }
            lv = nv;
            break;
        }
        if (Math.abs(lv[0] - hw) < COMPONENT_GRID_SIZE) {
            if (shipRandomizer.sb(factionRandomizer.hd(0, 1, "com middleness"))) {
                lv[0] = hw;
            }
        }
        components[shipRandomizer.schoose(componentChances)](lv);
        totaldone++;
    }
    // Mirror
    cfx.clearRect(hw + (w % 2), 0, w, h);
    cfx.scale(-1, 1);
    cfx.drawImage(cf, 0 - w, 0);
    return cf;
}

// CONCATENATED MODULE: ./src/index.ts
//



function generateFactionRandomizer(seed) {
    return new Randomizer(seed);
}
function generateShip(factionRandomizer, seed, size) {
    return buildShip(factionRandomizer, seed, size);
}

// CONCATENATED MODULE: ./src/demo.js


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
       true ? factionSeed : undefined;
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


/***/ })
/******/ ]);