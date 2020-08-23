(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["starshipwright"] = factory();
	else
		root["starshipwright"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
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

// EXPORTS
__webpack_require__.d(__webpack_exports__, "generateShip", function() { return /* binding */ generateShip; });

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
        this.state = 3234042090;
        for (var i = this.seed.length - 1; i >= 0; i--) {
            var c = this.seed.charCodeAt(i);
            this.state =
                (((this.state << 5) + this.state) ^
                    c ^
                    (this.state << ((c % 13) + 1)) ^
                    (this.state >> ((c % 17) + 1))) >>>
                    0;
            this.stateArray[i % 8] ^=
                (((this.state >> 9) * ((this.state % 16384) + 3427)) ^ c) >>> 0;
        }
    }
    //Returns a raw unsigned 32-bit integer from the stream.
    sr() {
        var c = this.seed.charCodeAt(this.seedPosition);
        var lsa = this.stateArray[this.arrayPosition];
        this.state =
            (((this.state << 5) + this.state + lsa) ^
                c ^
                (this.state << ((c % 17) + 1)) ^
                (this.state >> ((c % 13) + 1))) >>>
                0;
        this.stateArray[this.arrayPosition] =
            ((lsa >> 3) ^
                (lsa << ((c % 19) + 1)) ^
                ((this.state % 134217728) * 3427)) >>>
                0;
        this.seedPosition = (this.seedPosition + 1) % this.seed.length;
        this.arrayPosition = (this.arrayPosition + 1) % 8;
        return this.state;
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
    hr_xorshift(seed) {
        const state = [1160605769, 1424711319, 876532818, 1419174464];
        let rv = 1206170165;
        if (seed == null) {
            seed = "?/?/?/";
            rv = 3379896793;
        }
        if (this.hrCache.hasOwnProperty(seed)) {
            return this.hrCache[seed];
        }
        for (var x = seed.length - 1; x >= 0; x--) {
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
        for (var y = this.seed.length - 1; y >= 0; y--) {
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
    //Returns a double between the specified minimum and maximum, by hashing this object's seed with the specified string.
    hd(min, max, seed) {
        return (((this.hr_xorshift(seed) * 4294967296 + this.hr_xorshift(seed + "@")) /
            18446744073709551616) *
            (max - min) +
            min);
    }
    //Returns an integer between the specified minimum and maximum, from the stream.
    si(min, max) {
        return Math.floor(((this.sr() * 4294967296 + this.sr()) / 18446744073709551616) *
            (max + 1 - min) +
            min);
    }
    //Returns an integer between the specified minimum and maximum, by hashing this object's seed with the specified string.
    hi(min, max, s) {
        return Math.floor(((this.hr_xorshift(s) * 4294967296 + this.hr_xorshift(s + "@")) /
            18446744073709551616) *
            (max + 1 - min) +
            min);
    }
    //Returns a boolean with the specified chance of being true (and false otherwise), from the stream
    sb(chance) {
        return (this.sr() * 4294967296 + this.sr()) / 18446744073709551616 < chance;
    }
    //Returns a boolean with the specified chance of being true (and false otherwise), by hashing this object's seed with the specified string.
    hb(chance, s) {
        return ((this.hr_xorshift(s) * 4294967296 + this.hr_xorshift(s + "@")) /
            18446744073709551616 <
            chance);
    }
    //Returns an integer with the specified chance of being -1 (and 1 otherwise), from the stream.
    ss(chance) {
        return (this.sr() * 4294967296 + this.sr()) / 18446744073709551616 < chance
            ? -1
            : 1;
    }
    //Returns an integer with the specified chance of being -1 (and 1 otherwise), by hashing this object's seed with the specified string.
    hs(chance, seed) {
        return (this.hr_xorshift(seed) * 4294967296 +
            this.hr_xorshift(seed + "@")) /
            18446744073709551616 <
            chance
            ? -1
            : 1;
    }
    //Returns an integer {0,1,2,...}, starting from 0, with the specified chance of advancing to each successive integer, from the stream.
    sseq(chance, max) {
        var rv = 0;
        while ((this.sr() * 4294967296 + this.sr()) / 18446744073709551616 < chance &&
            rv < max) {
            rv++;
        }
        return rv;
    }
    //Returns an integer {0,1,2,...}, starting from 0, with the specified chance of advancing to each successive integer, by hashing this object's seed with the specified string.
    hseq(chance, max, seed) {
        var rv = 0;
        while ((this.hr_xorshift(seed + rv) * 4294967296 +
            this.hr_xorshift(seed + "@" + rv)) /
            18446744073709551616 <
            chance &&
            rv < max) {
            rv++;
        }
        return rv;
    }
    //Returns an index of the array chances with the relative probability equal to that element of chances, based on a stream value.
    schoose(chances) {
        var sum = 0;
        for (var i = 0; i < chances.length; i++) {
            sum += chances[i];
        }
        var which = this.sd(0, sum);
        for (var j = 0; j < chances.length; j++) {
            which -= chances[j];
            if (which < 0) {
                return j;
            }
        }
        return 0;
    }
    //Returns an index of the array chances with the relative probability equal to that element of chances, based on a hash value with the specified seed.
    hchoose(chances, seed) {
        var sum = 0;
        for (var i = 0; i < chances.length; i++) {
            sum += chances[i];
        }
        var which = this.hd(0, sum, seed);
        for (var j = 0; j < chances.length; j++) {
            which -= chances[j];
            if (which < 0) {
                return j;
            }
        }
        return 0;
    }
}

// CONCATENATED MODULE: ./src/utils.ts
function copyArray(a, begin, end) {
    const rv = new Array(end - begin);
    for (let i = end; i >= begin; i--) {
        rv[i - begin] = a[i];
    }
    return rv;
}
function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}
function hexpad(n, l) {
    //For integer n and length l.
    var s = Math.floor(n).toString(16);
    while (s.length < l) {
        s = "0" + s;
    }
    return s;
}
function colorToHex(color) {
    return ("#" +
        hexpad(Math.floor(clamp(color[0], 0, 1) * 255), 2) +
        (hexpad(Math.floor(clamp(color[1], 0, 1) * 255), 2) +
            hexpad(Math.floor(clamp(color[2], 0, 1) * 255), 2)));
}
// Take a color and multiplies it with a factor. factor = 0 produces black.
function scaleColorBy(color, factor) {
    return [color[0] * factor, color[1] * factor, color[2] * factor];
}
// Takes a triplet [H,S,V] and returns a triplet [R,G,B], representing the same color. All components are 0 - 1.
function hsvToRgb(hsv) {
    var c = hsv[1] * hsv[2];
    var m = hsv[2] - c;
    var h = ((hsv[0] % 1) + 1) % 1;
    var hrel = 6 * h;
    var hseg = Math.floor(hrel);
    var x = c * (1 - Math.abs((hrel % 2) - 1));
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


class faction_Faction {
    constructor(seed) {
        //Respective chances of each component
        this.componentChances = [];
        this.colors = [];
        this.colorChances = [];
        this.seed = seed;
        this.r = new Randomizer(this.seed);
        this.cache = {}; //Data cache.
        this.setupComponentChances();
        this.setupColors();
    }
    setupComponentChances() {
        this.componentChances = [];
        const dp = 8; //Default maximum power
        this.componentChances[0] =
            0.8 * this.r.sd(0.001, 1) * Math.pow(2, this.r.sd(0, dp));
        this.componentChances[1] =
            0.9 * this.r.sd(0.01, 1) * Math.pow(2, this.r.sd(0, dp));
        this.componentChances[2] =
            1 * this.r.sd(0.001, 1) * Math.pow(2, this.r.sd(0, dp));
        this.componentChances[3] =
            3 * this.r.sd(0, 1) * Math.pow(2, this.r.sd(0, dp));
        this.componentChances[4] =
            0.5 * this.r.sd(0, 1) * Math.pow(2, this.r.sd(0, dp));
        this.componentChances[5] =
            0.05 * this.r.sd(0, 1) * Math.pow(2, this.r.sd(0, dp));
        this.componentChances[6] =
            0.5 * this.r.sd(0, 1) * Math.pow(2, this.r.sd(0, dp));
    }
    setupColors() {
        const dp = 6; //Default maximum power.
        const baseColorCount = 1 +
            (this.r.hb(0.7, "base color +1") ? 1 : 0) +
            this.r.hseq(0.3, 3, "base color count");
        for (let i = 0; i < baseColorCount; i++) {
            const ls = "base color" + i;
            this.colors.push(hsvToRgb([
                Math.pow(this.r.hd(0, 1, ls + "hue"), 2),
                clamp(this.r.hd(-0.2, 1, ls + "saturation"), 0, Math.pow(this.r.hd(0, 1, ls + "saturation bound"), 4)),
                clamp(this.r.hd(0.7, 1.1, ls + "value"), 0, 1),
            ]));
            this.colorChances.push(Math.pow(2, this.r.hd(0, dp, ls + "chances")));
        }
    }
    //Where lp is the ship to get the color for.
    getBaseColor(lp) {
        let rv = this.colors[lp.r.schoose(this.colorChances)];
        if ( true &&
            lp.r.sb(Math.pow(this.r.hd(0, 0.5, "base color shift chance"), 2))) {
            rv = [rv[0], rv[1], rv[2]];
            rv[0] = clamp(rv[0] +
                Math.pow(this.r.hd(0, 0.6, "base color shift range red"), 2) *
                    clamp(lp.r.sd(-1, 1.2), 0, 1) *
                    clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1), 0, 1);
            rv[1] = clamp(rv[1] +
                Math.pow(this.r.hd(0, 0.6, "base color shift range green"), 2) *
                    clamp(lp.r.sd(-1, 1.2), 0, 1) *
                    clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1), 0, 1);
            rv[2] = clamp(rv[2] +
                Math.pow(this.r.hd(0, 0.6, "base color shift range blue"), 2) *
                    clamp(lp.r.sd(-1, 1.2), 0, 1) *
                    clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1), 0, 1);
        }
        return rv;
    }
}

// CONCATENATED MODULE: ./src/constants.ts
//Size of the component grid
const COMPONENT_GRID_SIZE = 6;
//Minimum distance between the edge of the ship outline and the edge of the canvas
const CANVAS_SHIP_EDGE = 24;
//Base maximum extent of a component from its origin point. Should be at least equal to cgridsize, but no greater than csedge.
const COMPONENT_MAXIMUM_SIZE = 8;

// CONCATENATED MODULE: ./src/components.ts


function backness(lp, v) {
    return v[1] / lp.h;
}
function frontness(lp, v) {
    return 1 - v[1] / lp.h;
}
function centerness(lp, v, doX, doY) {
    let rv = 1;
    if (doX) {
        rv = Math.min(rv, 1 - Math.abs(v[0] - lp.hw) / lp.hw);
    }
    if (doY) {
        rv = Math.min(rv, 1 - Math.abs(v[1] - lp.hh) / lp.hh);
    }
    return rv;
}
function bigness(lp, v) {
    const effectCenter = centerness(lp, v, true, true);
    const effectShipsize = 1 - 1 / ((lp.w + lp.h) / 1000 + 1);
    const effectFaction = Math.pow(lp.f.r.hd(0, 1, "master bigness"), 0.5);
    const effectStack = 1 - lp.getpcdone();
    return effectCenter * effectShipsize * effectFaction * effectStack;
}
function leeway(lp, boundingBox) {
    return [
        Math.min(boundingBox[0][0] - CANVAS_SHIP_EDGE, lp.w - CANVAS_SHIP_EDGE - boundingBox[1][0]),
        Math.min(boundingBox[0][1] - CANVAS_SHIP_EDGE, lp.h - CANVAS_SHIP_EDGE - boundingBox[1][1]),
    ];
}
function shadowcolor(amount) {
    //amount is the amount of shadow, 0 - 1.
    return "rgba(0,0,0," + clamp(amount, 0, 1) + ")";
}
//lp is the ship. amount is the amount of shadow at the edges, 0 - 1 (the middle is always 0). middlep and edgep should be vectors at the middle and edge of the gradient.
function shadowGradient(lp, middlePoint, edgePoint, amount) {
    const grad = lp.cfx.createLinearGradient(edgePoint[0], edgePoint[1], middlePoint[0] * 2 - edgePoint[0], middlePoint[1] * 2 - edgePoint[1]);
    const darkness = shadowcolor(amount);
    grad.addColorStop(0, darkness);
    grad.addColorStop(0.5, "rgba(0,0,0,0)");
    grad.addColorStop(1, darkness);
    return grad;
}
// Each component function takes an argument 'lp' (for the ship) and 'v' (an integral 2-vector denoting the center of the component)
const components = [];
// Bordered block
components[0] = function (lp, v) {
    let lcms = COMPONENT_MAXIMUM_SIZE;
    const bn = Math.pow(bigness(lp, v), 0.3);
    if (lp.r.sb(lp.f.r.hd(0, 0.9, "com0 bigchance") * bn)) {
        const chance = lp.f.r.hd(0, 0.5, "com0 bigincchance");
        while (lp.r.sb(chance * bn)) {
            const lw = leeway(lp, [
                [v[0] - lcms, v[1] - lcms],
                [v[0] + lcms, v[1] + lcms],
            ]);
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
        Math.ceil(lp.r.sd(1, Math.max(2, 0.5 * lcms))),
        Math.ceil(lp.r.sd(1, Math.max(2, 0.5 * lcms))),
    ];
    const borderwidth = Math.min(dhi[0], dhi[1]) * lp.r.sd(0.1, 1.2);
    const dho = [dhi[0] + borderwidth * 2, dhi[1] + borderwidth * 2];
    const counts = [Math.ceil(lcms2 / dho[0]), Math.ceil(lcms2 / dho[1])];
    const trv = [
        Math.round((counts[0] * dho[0]) / 2),
        Math.round((counts[1] * dho[1]) / 2),
    ];
    const pcdone = lp.getpcdone();
    const basecolor = lp.f.getBaseColor(lp);
    const icolorh = colorToHex(scaleColorBy(basecolor, lp.r.sd(0.4, 1)));
    const ocolorh = colorToHex(scaleColorBy(basecolor, lp.r.sd(0.4, 1)));
    lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.25) + ")";
    lp.cfx.fillRect(v[0] - trv[0] - 1, v[1] - trv[1] - 1, dho[0] * counts[0] + 2, dho[1] * counts[1] + 2);
    lp.cfx.fillStyle = ocolorh;
    lp.cfx.fillRect(v[0] - trv[0], v[1] - trv[1], dho[0] * counts[0], dho[1] * counts[1]);
    lp.cfx.fillStyle = icolorh;
    for (let x = 0; x < counts[0]; x++) {
        const bx = v[0] + borderwidth + x * dho[0] - trv[0];
        for (let y = 0; y < counts[1]; y++) {
            const by = v[1] + borderwidth + y * dho[1] - trv[1];
            lp.cfx.fillRect(bx, by, dhi[0], dhi[1]);
        }
    }
    if (lp.r.sb(clamp((pcdone * 0.6 + 0.3) * (lcms / COMPONENT_MAXIMUM_SIZE), 0, 0.98))) {
        lp.cfx.fillStyle = shadowGradient(lp, v, [v[0] + trv[0], v[1]], lp.r.sd(0, 0.9));
        lp.cfx.fillRect(v[0] - trv[0], v[1] - trv[1], dho[0] * counts[0], dho[1] * counts[1]);
    }
};
// Cylinder array
components[1] = function (lp, v) {
    let lcms = COMPONENT_MAXIMUM_SIZE;
    const bn = Math.pow(bigness(lp, v), 0.2);
    if (lp.r.sb(lp.f.r.hd(0.3, 1, "com1 bigchance") * bn)) {
        const chance = lp.f.r.hd(0, 0.6, "com1 bigincchance");
        while (lp.r.sb(chance * bn)) {
            const lw = leeway(lp, [
                [v[0] - lcms, v[1] - lcms],
                [v[0] + lcms, v[1] + lcms],
            ]);
            if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                lcms *= 1.5;
            }
            else {
                break;
            }
        }
    }
    let w = Math.ceil(lp.r.sd(0.8, 2) * lcms);
    const h = Math.ceil(lp.r.sd(0.8, 2) * lcms);
    const cw = lp.r.si(3, Math.max(4, w));
    const count = Math.max(1, Math.round(w / cw));
    w = count * cw;
    const basecolor = lp.f.getBaseColor(lp);
    const ccolor = colorToHex(scaleColorBy(basecolor, lp.r.sd(0.5, 1)));
    const darkness = lp.r.sd(0.3, 0.9);
    // true = horizontal array, false = vertical array
    const orientation = lp.r.sb(clamp(lp.f.r.hd(-0.2, 1.2, "com1 hchance"), 0, 1));
    if (orientation) {
        const bv = [v[0] - Math.floor(w / 2), v[1] - Math.floor(h / 2)];
        lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.25) + ")";
        lp.cfx.fillRect(bv[0] - 1, bv[1] - 1, w + 2, h + 2);
        lp.cfx.fillStyle = ccolor;
        lp.cfx.fillRect(bv[0], bv[1], w, h);
        for (let i = 0; i < count; i++) {
            lp.cfx.fillStyle = shadowGradient(lp, [bv[0] + (i + 0.5) * cw, v[1]], [bv[0] + i * cw, v[1]], darkness);
            lp.cfx.fillRect(bv[0] + i * cw, bv[1], cw, h);
        }
    }
    else {
        const bv = [v[0] - Math.floor(h / 2), v[1] - Math.floor(w / 2)];
        lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.25) + ")";
        lp.cfx.fillRect(bv[0] - 1, bv[1] - 1, h + 2, w + 2);
        lp.cfx.fillStyle = ccolor;
        lp.cfx.fillRect(bv[0], bv[1], h, w);
        for (let i = 0; i < count; i++) {
            lp.cfx.fillStyle = shadowGradient(lp, [v[0], bv[1] + (i + 0.5) * cw], [v[0], bv[1] + i * cw], darkness);
            lp.cfx.fillRect(bv[0], bv[1] + i * cw, w, cw);
        }
    }
};
// Banded cylinder
components[2] = function (lp, v) {
    let lcms = COMPONENT_MAXIMUM_SIZE;
    const bn = Math.pow(bigness(lp, v), 0.05);
    if (lp.r.sb(lp.f.r.hd(0, 1, "com2 bigchance") * bn)) {
        const chance = lp.f.r.hd(0, 0.9, "com2 bigincchance");
        while (lp.r.sb(chance * bn)) {
            const lw = leeway(lp, [
                [v[0] - lcms, v[1] - lcms],
                [v[0] + lcms, v[1] + lcms],
            ]);
            if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                lcms *= 1.5;
            }
            else {
                break;
            }
        }
    }
    const w = Math.ceil(lp.r.sd(0.6, 1.4) * lcms);
    const h = Math.ceil(lp.r.sd(1, 2) * lcms);
    const wh2 = [
        Math.ceil(clamp((w * lp.r.sd(0.7, 1)) / 2, 1, w)),
        Math.ceil(clamp((w * lp.r.sd(0.8, 1)) / 2, 1, w)),
    ];
    const h2 = [
        Math.floor(clamp(w * lp.r.sd(0.05, 0.25), 1, h)),
        Math.floor(clamp(w * lp.r.sd(0.1, 0.3), 1, h)),
    ];
    const hpair = h2[0] + h2[1];
    const odd = lp.r.sb(Math.pow(lp.f.r.hd(0, 1, "com2 oddchance"), 0.5));
    const count = clamp(Math.floor(h / hpair), 1, h);
    const htotal = count * hpair + (odd ? h2[0] : 0);
    const basecolor = lp.f.getBaseColor(lp);
    const color2 = [
        scaleColorBy(basecolor, lp.r.sd(0.6, 1)),
        scaleColorBy(basecolor, lp.r.sd(0.6, 1)),
    ];
    const darkness = lp.r.sd(0.5, 0.95);
    const lightness = 1 - darkness;
    const colord2 = [
        scaleColorBy(color2[0], lightness),
        scaleColorBy(color2[1], lightness),
    ];
    const orientation = lp.r.sb(Math.pow(lp.f.r.hd(0, 1, "com2 verticalchance"), 0.1));
    if (orientation) {
        const grad2 = [
            lp.cfx.createLinearGradient(v[0] - wh2[0], v[1], v[0] + wh2[0], v[1]),
            lp.cfx.createLinearGradient(v[0] - wh2[1], v[1], v[0] + wh2[1], v[1]),
        ];
        grad2[0].addColorStop(0, colorToHex(colord2[0]));
        grad2[0].addColorStop(0.5, colorToHex(color2[0]));
        grad2[0].addColorStop(1, colorToHex(colord2[0]));
        grad2[1].addColorStop(0, colorToHex(colord2[1]));
        grad2[1].addColorStop(0.5, colorToHex(color2[1]));
        grad2[1].addColorStop(1, colorToHex(colord2[1]));
        const by = Math.floor(v[1] - htotal / 2);
        for (let i = 0; i < count; i++) {
            lp.cfx.fillStyle = grad2[0];
            lp.cfx.fillRect(v[0] - wh2[0], by + i * hpair, wh2[0] * 2, h2[0]);
            lp.cfx.fillStyle = grad2[1];
            lp.cfx.fillRect(v[0] - wh2[1], by + i * hpair + h2[0], wh2[1] * 2, h2[1]);
        }
        if (odd) {
            lp.cfx.fillStyle = grad2[0];
            lp.cfx.fillRect(v[0] - wh2[0], by + count * hpair, wh2[0] * 2, h2[0]);
        }
    }
    else {
        const grad2 = [
            lp.cfx.createLinearGradient(v[0], v[1] - wh2[0], v[0], v[1] + wh2[0]),
            lp.cfx.createLinearGradient(v[0], v[1] - wh2[1], v[0], v[1] + wh2[1]),
        ];
        grad2[0].addColorStop(0, colorToHex(colord2[0]));
        grad2[0].addColorStop(0.5, colorToHex(color2[0]));
        grad2[0].addColorStop(1, colorToHex(colord2[0]));
        grad2[1].addColorStop(0, colorToHex(colord2[1]));
        grad2[1].addColorStop(0.5, colorToHex(color2[1]));
        grad2[1].addColorStop(1, colorToHex(colord2[1]));
        const bx = Math.floor(v[0] - htotal / 2);
        for (let i = 0; i < count; i++) {
            lp.cfx.fillStyle = grad2[0];
            lp.cfx.fillRect(bx + i * hpair, v[1] - wh2[0], h2[0], wh2[0] * 2);
            lp.cfx.fillStyle = grad2[1];
            lp.cfx.fillRect(bx + i * hpair + h2[0], v[1] - wh2[1], h2[1], wh2[1] * 2);
        }
        if (odd) {
            lp.cfx.fillStyle = grad2[0];
            lp.cfx.fillRect(bx + count * hpair, v[1] - wh2[0], h2[0], wh2[0] * 2);
        }
    }
};
//Rocket engine (or tries to call another random component if too far forward)
components[3] = function (lp, v) {
    if (lp.r.sb(frontness(lp, v) - 0.3) ||
        lp.getcellstate(v[0], v[1] + COMPONENT_GRID_SIZE * 1.2) > 0 ||
        lp.getcellstate(v[0], v[1] + COMPONENT_GRID_SIZE * 1.8) > 0) {
        for (let tries = 0; tries < 100; tries++) {
            const which = lp.r.schoose(lp.f.componentChances);
            if (which != 3) {
                components[which](lp, v);
                return;
            }
        }
    }
    let lcms = COMPONENT_MAXIMUM_SIZE;
    const bn = Math.pow(bigness(lp, v), 0.1);
    if (lp.r.sb(lp.f.r.hd(0.6, 1, "com3 bigchance") * bn)) {
        const chance = lp.f.r.hd(0.3, 0.8, "com3 bigincchance");
        while (lp.r.sb(chance * bn)) {
            const lw = leeway(lp, [
                [v[0] - lcms, v[1] - lcms],
                [v[0] + lcms, v[1] + lcms],
            ]);
            if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                lcms *= 1.5;
            }
            else {
                break;
            }
        }
    }
    const w = lp.r.sd(1, 2) * lcms;
    let h = Math.ceil(lp.r.sd(0.3, 1) * lcms);
    const nratio = lp.r.sd(0.25, 0.6);
    const nw = w * nratio;
    const midw = (w + nw) / 2;
    const midwh = midw / 2;
    const h2 = [
        Math.max(1, Math.ceil(h * lp.r.sd(0.08, 0.25))),
        Math.max(1, Math.ceil(h * lp.r.sd(0.03, 0.15))),
    ];
    const hpair = h2[0] + h2[1];
    const count = Math.ceil(h / hpair);
    h = count * hpair + h2[0];
    lp.f.setupColors();
    const basecolor = lp.f.colors[lp.f.r.hchoose(lp.f.colorChances, "com3 basecolor")];
    const lightness0_mid = lp.f.r.hd(0.5, 0.8, "com3 lightness0 mid");
    const lightness0_edge = lightness0_mid - lp.f.r.hd(0.2, 0.4, "com3 lightness0 edge");
    const lightness1_edge = lp.f.r.hd(0, 0.2, "com3 lightness1 edge");
    const grad2 = [
        lp.cfx.createLinearGradient(v[0] - midwh, v[1], v[0] + midwh, v[1]),
        lp.cfx.createLinearGradient(v[0] - midwh, v[1], v[0] + midwh, v[1]),
    ];
    grad2[0].addColorStop(0, colorToHex(scaleColorBy(basecolor, lightness0_edge)));
    grad2[0].addColorStop(0.5, colorToHex(scaleColorBy(basecolor, lightness0_mid)));
    grad2[0].addColorStop(1, colorToHex(scaleColorBy(basecolor, lightness0_edge)));
    grad2[1].addColorStop(0, colorToHex(scaleColorBy(basecolor, lightness1_edge)));
    grad2[1].addColorStop(0.5, colorToHex(basecolor));
    grad2[1].addColorStop(1, colorToHex(scaleColorBy(basecolor, lightness1_edge)));
    const by = Math.ceil(v[1] - h / 2);
    lp.cfx.fillStyle = grad2[0];
    lp.cfx.beginPath();
    lp.cfx.moveTo(v[0] - nw / 2, by);
    lp.cfx.lineTo(v[0] + nw / 2, by);
    lp.cfx.lineTo(v[0] + w / 2, by + h);
    lp.cfx.lineTo(v[0] - w / 2, by + h);
    lp.cfx.fill();
    lp.cfx.fillStyle = grad2[1];
    const byh = [by + h2[0], by + hpair];
    for (let i = 0; i < count; i++) {
        const lyr = [i * hpair + h2[0], (i + 1) * hpair];
        const ly = [byh[0] + i * hpair, byh[1] + i * hpair];
        const lw = [
            (nw + (w - nw) * (lyr[0] / h)) / 2,
            (nw + (w - nw) * (lyr[1] / h)) / 2,
        ];
        lp.cfx.beginPath();
        lp.cfx.moveTo(v[0] - lw[0], ly[0]);
        lp.cfx.lineTo(v[0] + lw[0], ly[0]);
        lp.cfx.lineTo(v[0] + lw[1], ly[1]);
        lp.cfx.lineTo(v[0] - lw[1], ly[1]);
        lp.cfx.fill();
    }
};
//Elongated cylinder (calls component 0 - 2 on top of its starting point)
components[4] = function (lp, v) {
    const cn = centerness(lp, v, true, false);
    const lightmid = lp.r.sd(0.7, 1);
    const lightedge = lp.r.sd(0, 0.2);
    const basecolor = lp.f.getBaseColor(lp);
    const colormid = colorToHex(scaleColorBy(basecolor, lightmid));
    const coloredge = colorToHex(scaleColorBy(basecolor, lightedge));
    if (lp.f.cache["com4 directionc"] == null) {
        lp.f.cache["com4 directionc"] = [
            1 * Math.pow(lp.f.r.hd(0, 1, "com4 directionc0"), 4),
            0.1 * Math.pow(lp.f.r.hd(0, 1, "com4 directionc1"), 4),
            0.2 * Math.pow(lp.f.r.hd(0, 1, "com4 directionc2"), 4),
        ];
    }
    const w = Math.max(3, Math.ceil(lp.size *
        Math.pow(lp.r.sd(0.4, 1), 2) *
        lp.f.r.hd(0.02, 0.1, "com4 maxwidth")));
    const hwi = Math.floor(w / 2);
    const hwe = w % 2;
    const direction = lp.r.schoose([
        lp.f.cache["com4 directionc"][0] * (2 - cn),
        lp.f.cache["com4 directionc"][1],
        lp.f.cache["com4 directionc"][2] * (1 + cn),
    ]);
    let ev = null;
    if (direction == 0) {
        //forwards
        const hlimit = v[1] - CANVAS_SHIP_EDGE;
        const h = Math.min(Math.max(COMPONENT_MAXIMUM_SIZE, hlimit - lp.r.si(0, COMPONENT_MAXIMUM_SIZE * 2)), Math.floor(0.7 * lp.size * Math.pow(lp.r.sd(0, 1), lp.f.r.hd(2, 6, "com4 hpower0"))));
        const bb = [
            [v[0] - hwi, v[1] - h],
            [v[0] + hwi + hwe, v[1]],
        ];
        const grad = lp.cfx.createLinearGradient(bb[0][0], bb[0][1], bb[1][0], bb[0][1]);
        grad.addColorStop(0, coloredge);
        grad.addColorStop(0.5, colormid);
        grad.addColorStop(1, coloredge);
        lp.cfx.fillStyle = grad;
        lp.cfx.fillRect(bb[0][0], bb[0][1], w, h);
        ev = [v[0], v[1] - h];
    }
    else if (direction == 1) {
        //backwards
        const hlimit = lp.h - (CANVAS_SHIP_EDGE + v[1]);
        const h = Math.min(Math.max(COMPONENT_MAXIMUM_SIZE, hlimit - lp.r.si(0, COMPONENT_MAXIMUM_SIZE * 2)), Math.floor(0.6 * lp.size * Math.pow(lp.r.sd(0, 1), lp.f.r.hd(2, 7, "com4 hpower1"))));
        const bb = [
            [v[0] - hwi, v[1]],
            [v[0] + hwi + hwe, v[1] + h],
        ];
        const grad = lp.cfx.createLinearGradient(bb[0][0], bb[0][1], bb[1][0], bb[0][1]);
        grad.addColorStop(0, coloredge);
        grad.addColorStop(0.5, colormid);
        grad.addColorStop(1, coloredge);
        lp.cfx.fillStyle = grad;
        lp.cfx.fillRect(bb[0][0], bb[0][1], w, h);
        ev = [v[0], v[1] + h];
    }
    else if (direction == 2) {
        //to center
        const grad = lp.cfx.createLinearGradient(v[0], v[1] - hwi, v[0], v[1] + hwi + hwe);
        grad.addColorStop(0, coloredge);
        grad.addColorStop(0.5, colormid);
        grad.addColorStop(1, coloredge);
        lp.cfx.fillStyle = grad;
        lp.cfx.fillRect(v[0], v[1] - hwi, Math.ceil(lp.hw - v[0]) + 1, w);
        ev = [Math.floor(lp.hw), v[1]];
    }
    if (lp.f.cache["com4 covercomc"] == null) {
        lp.f.cache["com4 covercomc"] = [
            0.6 * Math.pow(lp.f.r.hd(0, 1, "com4 covercomc0"), 2),
            0.2 * Math.pow(lp.f.r.hd(0, 1, "com4 covercomc1"), 2),
            1 * Math.pow(lp.f.r.hd(0, 1, "com4 covercomc2"), 2),
        ];
    }
    components[lp.r.schoose(lp.f.cache["com4 covercomc"])](lp, v);
    if (lp.getcellstate(ev[0], ev[1]) > 0) {
        const nev = [
            ev[0] + Math.round(lp.r.sd(-1, 1) * COMPONENT_GRID_SIZE),
            ev[1] + Math.round(lp.r.sd(-1, 1) * COMPONENT_GRID_SIZE),
        ];
        if (lp.getcellstate(nev[0], nev[1]) > 0) {
            components[lp.r.schoose(lp.f.cache["com4 covercomc"])](lp, nev);
        }
        else {
            components[lp.r.schoose(lp.f.cache["com4 covercomc"])](lp, ev);
        }
    }
};
//Ball
components[5] = function (lp, v) {
    let lcms = COMPONENT_MAXIMUM_SIZE;
    const bn = Math.pow(bigness(lp, v), 0.1);
    if (lp.r.sb(lp.f.r.hd(0, 0.9, "com5 bigchance") * bn)) {
        const chance = lp.f.r.hd(0, 0.8, "com5 bigincchance");
        while (lp.r.sb(chance * bn)) {
            const lw = leeway(lp, [
                [v[0] - lcms, v[1] - lcms],
                [v[0] + lcms, v[1] + lcms],
            ]);
            if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                lcms *= 1.5;
            }
            else {
                break;
            }
        }
    }
    const lightmid = lp.r.sd(0.75, 1);
    const lightedge = lp.r.sd(0, 0.25);
    const basecolor = lp.f.getBaseColor(lp);
    const colormid = colorToHex(scaleColorBy(basecolor, lightmid));
    const coloredge = colorToHex(scaleColorBy(basecolor, lightedge));
    const countx = 1 +
        lp.r.sseq(lp.f.r.hd(0, 1, "com5 multxc"), Math.floor(1.2 * Math.pow(lcms / COMPONENT_MAXIMUM_SIZE, 0.6)));
    const county = 1 +
        lp.r.sseq(lp.f.r.hd(0, 1, "com5 multyc"), Math.floor(1.2 * Math.pow(lcms / COMPONENT_MAXIMUM_SIZE, 0.6)));
    const smallr = (lp.r.sd(0.5, 1) * lcms) / Math.max(countx, county);
    const drawr = smallr + 0.5;
    const shadowr = smallr + 1;
    const centerr = smallr * 0.2;
    const hw = smallr * countx;
    const hh = smallr * county;
    const bv = [v[0] - hw, v[1] - hh];
    lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.2) + ")";
    for (let ax = 0; ax < countx; ax++) {
        const px = bv[0] + (ax * 2 + 1) * smallr;
        for (let ay = 0; ay < county; ay++) {
            const py = bv[1] + (ay * 2 + 1) * smallr;
            lp.cfx.beginPath();
            lp.cfx.arc(px, py, shadowr, 0, 2 * Math.PI);
            lp.cfx.fill();
        }
    }
    for (let ax = 0; ax < countx; ax++) {
        const px = bv[0] + (ax * 2 + 1) * smallr;
        for (let ay = 0; ay < county; ay++) {
            const py = bv[1] + (ay * 2 + 1) * smallr;
            const grad = lp.cfx.createRadialGradient(px, py, centerr, px, py, drawr);
            grad.addColorStop(0, colormid);
            grad.addColorStop(1, coloredge);
            lp.cfx.fillStyle = grad;
            lp.cfx.beginPath();
            lp.cfx.arc(px, py, drawr, 0, 2 * Math.PI);
            lp.cfx.fill();
        }
    }
};
//Forward-facing trapezoidal fin
components[6] = function (lp, v) {
    if (lp.nextpass <= 0 || lp.r.sb(frontness(lp, v))) {
        components[lp.r.schoose(copyArray(lp.f.componentChances, 0, 5))](lp, v);
        return;
    }
    let lcms = COMPONENT_MAXIMUM_SIZE;
    const bn = Math.pow(bigness(lp, v), 0.05);
    if (lp.r.sb(lp.f.r.hd(0, 0.9, "com6 bigchance") * bn)) {
        const chance = lp.f.r.hd(0, 0.8, "com6 bigincchance");
        while (lp.r.sb(chance * bn)) {
            const lw = leeway(lp, [
                [v[0] - lcms, v[1] - lcms],
                [v[0] + lcms, v[1] + lcms],
            ]);
            if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
                lcms *= 1.5;
            }
            else {
                break;
            }
        }
    }
    const h0 = Math.ceil(lcms * 2 * lp.r.sd(0.6, 1)); //Inner height, longer.
    const hh0i = Math.floor(h0 / 2);
    const hh0e = h0 % 2;
    //Outer height, shorter
    const h1 = h0 *
        Math.pow(lp.r.sd(Math.pow(lp.f.r.hd(0, 0.8, "com6 h1min"), 0.5), 0.9), lp.f.r.hd(0.5, 1.5, "com6 h1power"));
    const hh1i = Math.floor(h1 / 2);
    const hh1e = h0 % 2;
    const backamount = Math.max(0 - (h0 - h1) / 2, h0 *
        (lp.r.sd(0, 0.45) + lp.r.sd(0, 0.45)) *
        (lp.f.cache["com6 backness"] == null
            ? (lp.f.cache["com6 backness"] = lp.f.r.hb(0.8, "com6 backnesstype")
                ? lp.f.r.hd(0.2, 0.9, "com6 backness#pos")
                : lp.f.r.hd(-0.2, -0.05, "com6 backness#neg"))
            : lp.f.cache["com6 backness"]));
    const w = Math.ceil(lcms * lp.r.sd(0.7, 1) * Math.pow(lp.f.r.hd(0.1, 3.5, "com6 width"), 0.5));
    const hwi = Math.floor(w / 2);
    const hwe = w % 2;
    const quad = [
        [v[0] - hwi, v[1] + backamount - hh1i],
        [v[0] + hwi + hwe, v[1] - hh0i],
        [v[0] + hwi + hwe, v[1] + hh0i + hh0e],
        [v[0] - hwi, v[1] + backamount + hh1i + hh1e],
    ];
    const basecolor = lp.f.getBaseColor(lp);
    lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.2) + ")";
    lp.cfx.beginPath();
    lp.cfx.moveTo(quad[0][0] - 1, quad[0][1]);
    lp.cfx.lineTo(quad[1][0] - 1, quad[1][1]);
    lp.cfx.lineTo(quad[2][0] - 1, quad[2][1]);
    lp.cfx.lineTo(quad[3][0] - 1, quad[3][1]);
    lp.cfx.fill();
    lp.cfx.fillStyle = colorToHex(scaleColorBy(basecolor, lp.r.sd(0.7, 1)));
    lp.cfx.beginPath();
    lp.cfx.moveTo(quad[0][0], quad[0][1]);
    lp.cfx.lineTo(quad[1][0], quad[1][1]);
    lp.cfx.lineTo(quad[2][0], quad[2][1]);
    lp.cfx.lineTo(quad[3][0], quad[3][1]);
    lp.cfx.fill();
};
/*
components["cabin !UNUSED"] = function (
  lp,
  v //Cabin
) {
  if (lp.nextpass <= 0 || lp.r.sb(backness(lp, v))) {
    components[lp.r.schoose(copyArray(lp.f.componentChances, 0, 5))](lp, v);
    return;
  }
  var lcms = cms;
  var bn = Math.pow(bigness(lp, v), 0.1);
  if (
    lp.r.sb(
      (lp.f.cache["com7 bigchance"] == null
        ? (lp.f.cache["com7 bigchance"] = lp.f.r.hd(0, 0.9, "com7 bigchance"))
        : lp.f.cache["com7 bigchance"]) * bn
    )
  ) {
    while (
      lp.r.sb(
        (lp.f.cache["com7 bigincchance"] == null
          ? (lp.f.cache["com7 bigincchance"] = lp.f.r.hd(
              0,
              0.9,
              "com7 bigincchance"
            ))
          : lp.f.cache["com7 bigincchance"]) * bn
      )
    ) {
      var lw = leeway(lp, [
        [v[0] - lcms, v[1] - lcms],
        [v[0] + lcms, v[1] + lcms],
      ]);
      if (Math.min(lw[0], lw[1]) > lcms * 0.5) {
        lcms *= 1.5;
      } else {
        break;
      }
    }
  }
  var h =
    lcms *
    lp.r.sd(1, 2) *
    (lp.f.cache["com7 height"] == null
      ? (lp.f.cache["com7 height"] = lp.f.r.hd(0.5, 1, "com7 height"))
      : lp.f.cache["com7 height"]);
  var hh = h / 2;
  var w =
    1 +
    h *
      (lp.f.cache["com7 width"] == null
        ? (lp.f.cache["com7 width"] = lp.f.r.hd(0.3, 0.8, "com7 width"))
        : lp.f.cache["com7 width"]);
  var hw = w / 2;
  var windowcolor = lp.f.getwindowcolor(lp);
  var lightness0 = lp.r.sd(0.7, 0.9);
  var lightness1 = lp.r.sd(0.4, 0.6);
  var color0 = scaleColorBy(windowcolor, lightness0);
  var color1 = scaleColorBy(windowcolor, lightness1);
  var transparency =
    lp.f.cache["com7 transparency"] == null
      ? (lp.f.cache["com7 transparency"] = lp.f.r.hd(0.3, 0.5, "com7 transparency"))
      : lp.f.cache["com7 transparency"];
  var grad = lp.cfx.createRadialGradient(0, 0, w / 20, 0, 0, w / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(
    0.3,
    "rgba(" +
      clamp(Math.round(color0[0] * 255), 0, 255) +
      ("," + clamp(Math.round(color0[1] * 255), 0, 255)) +
      ("," +
        clamp(Math.round(color0[2] * 255), 0, 255) +
        ("," + (1 - transparency) + ")"))
  );
  grad.addColorStop(
    1,
    "rgba(" +
      clamp(Math.round(color1[0] * 255), 0, 255) +
      ("," + clamp(Math.round(color1[1] * 255), 0, 255)) +
      ("," +
        clamp(Math.round(color1[2] * 255), 0, 255) +
        ("," + (1 - transparency / 2) + ")"))
  );
  lp.cfx.setTransform(1, 0, 0, h / w, v[0], v[1]);
  lp.cfx.fillStyle = grad;
  lp.cfx.beginPath();
  lp.cfx.arc(0, 0, w / 2, 0, pi2);
  lp.cfx.fill();
  lp.cfx.setTransform(1, 0, 0, 1, 0, 0);
};
*/
//END COMPONENTS

// CONCATENATED MODULE: ./src/outlines.ts


//Each outline function takes a single argument 'lp' denoting the ship to draw the outline for.
const outlines = [];
//Joined rectangles.
outlines[0] = function (lp) {
    var csarea = (lp.w - 2 * CANVAS_SHIP_EDGE) * (lp.h - 2 * CANVAS_SHIP_EDGE);
    var csarealimit = csarea * 0.05;
    var initialwidth = Math.ceil((lp.w - 2 * CANVAS_SHIP_EDGE) * lp.f.r.hd(0.1, 1, "outline0 iw") * 0.2);
    var blocks = [
        [
            [lp.hw - initialwidth, CANVAS_SHIP_EDGE],
            [lp.hw + initialwidth, lp.h - CANVAS_SHIP_EDGE],
        ],
    ];
    var blockcount = 2 +
        Math.floor(lp.r.sd(0.5, 1) * lp.f.r.hd(2, 8, "outline0 bc") * Math.sqrt(lp.size));
    for (var i = 1; i < blockcount; i++) {
        var base = blocks[lp.r.si(0, blocks.length - 1)];
        var v0 = [
            base[0][0] + lp.r.sd(0, 1) * (base[1][0] - base[0][0]),
            base[0][1] + lp.r.sd(0, 1) * (base[1][1] - base[0][1]),
        ];
        if (v0[1] < (base[0][1] + base[1][1]) * 0.5 &&
            lp.r.sb(lp.f.r.hd(0.5, 1.5, "outline0 frontbias"))) {
            v0[1] = base[1][1] - (v0[1] - base[0][1]);
        }
        var v1 = [
            clamp(lp.r.sd(0, 1) * lp.w, CANVAS_SHIP_EDGE, lp.w - CANVAS_SHIP_EDGE),
            clamp(lp.r.sd(0, 1) * lp.h, CANVAS_SHIP_EDGE, lp.h - CANVAS_SHIP_EDGE),
        ];
        var area = Math.abs((v1[0] - v0[0]) * (v1[1] - v0[1]));
        var ratio = csarealimit / area;
        if (ratio < 1) {
            v1[0] = v0[0] + (v1[0] - v0[0]) * ratio;
            v1[1] = v0[1] + (v1[1] - v0[1]) * ratio;
        }
        if (v0[0] > v1[0]) {
            var t = v0[0];
            v0[0] = v1[0];
            v1[0] = t;
        }
        if (v0[1] > v1[1]) {
            var t = v0[1];
            v0[1] = v1[1];
            v1[1] = t;
        }
        blocks.push([
            [Math.floor(v0[0]), Math.floor(v0[1])],
            [Math.ceil(v1[0]), Math.ceil(v1[1])],
        ]);
    }
    lp.csx.fillStyle = "#FFFFFF";
    for (var i = 0; i < blocks.length; i++) {
        var lb = blocks[i];
        lp.csx.fillRect(lb[0][0], lb[0][1], lb[1][0] - lb[0][0], lb[1][1] - lb[0][1]);
        lp.csx.fillRect(lp.w - lb[1][0], lb[0][1], lb[1][0] - lb[0][0], lb[1][1] - lb[0][1]);
    }
};
//Joined circles
outlines[1] = function (lp) {
    var csarea = (lp.w - 2 * CANVAS_SHIP_EDGE) * (lp.h - 2 * CANVAS_SHIP_EDGE);
    var csarealimit = csarea * 0.05;
    var csrlimit = Math.max(2, Math.sqrt(csarealimit / Math.PI));
    var initialwidth = Math.ceil((lp.w - 2 * CANVAS_SHIP_EDGE) * lp.f.r.hd(0.1, 1, "outline1 iw") * 0.2);
    var circles = [];
    var initialcount = Math.floor((lp.h - 2 * CANVAS_SHIP_EDGE) / (initialwidth * 2));
    for (var i = 0; i < initialcount; i++) {
        let lv = [lp.hw, lp.h - (CANVAS_SHIP_EDGE + initialwidth * (i * 2 + 1))];
        circles.push({ v: lv, r: initialwidth });
    }
    var circlecount = initialcount +
        Math.floor(lp.r.sd(0.5, 1) * lp.f.r.hd(10, 50, "outline1 cc") * Math.sqrt(lp.size));
    for (var i = initialcount; i < circlecount; i++) {
        var base = circles[Math.max(lp.r.si(0, circles.length - 1), lp.r.si(0, circles.length - 1))];
        var ncr = lp.r.sd(1, csrlimit);
        var pr = lp.r.sd(Math.max(0, base.r - ncr), base.r);
        var pa = lp.r.sd(0, 2 * Math.PI);
        if (pa > Math.PI && lp.r.sb(lp.f.r.hd(0.5, 1.5, "outline1 frontbias"))) {
            var pa = lp.r.sd(0, Math.PI);
        }
        let lv = [base.v[0] + Math.cos(pa) * pr, base.v[1] + Math.sin(pa) * pr];
        ncr = Math.min(ncr, lv[0] - CANVAS_SHIP_EDGE);
        ncr = Math.min(ncr, lp.w - CANVAS_SHIP_EDGE - lv[0]);
        ncr = Math.min(ncr, lv[1] - CANVAS_SHIP_EDGE);
        ncr = Math.min(ncr, lp.h - CANVAS_SHIP_EDGE - lv[1]);
        circles.push({ v: lv, r: ncr });
    }
    lp.csx.fillStyle = "#FFFFFF";
    for (let i = 0; i < circles.length; i++) {
        const lc = circles[i];
        lp.csx.beginPath();
        lp.csx.arc(lc.v[0], lc.v[1], lc.r, 0, 2 * Math.PI);
        lp.csx.fill();
        lp.csx.beginPath();
        lp.csx.arc(lp.w - lc.v[0], lc.v[1], lc.r, 0, 2 * Math.PI);
        lp.csx.fill();
    }
};
//Mess of lines
outlines[2] = function (lp) {
    var innersize = [lp.w - 2 * CANVAS_SHIP_EDGE, lp.h - 2 * CANVAS_SHIP_EDGE];
    var points = [
        [lp.hw, lp.r.sd(0, 0.05) * innersize[1] + CANVAS_SHIP_EDGE],
        [lp.hw, lp.r.sd(0.95, 1) * innersize[1] + CANVAS_SHIP_EDGE],
    ];
    var basefatness = COMPONENT_GRID_SIZE / lp.size +
        lp.f.r.hd(0.03, 0.1, "outline2 basefatness");
    var basemessiness = 1 / basefatness;
    var pointcount = Math.max(3, Math.ceil(basemessiness * lp.r.sd(0.05, 0.1) * Math.sqrt(lp.size)));
    // @ts-ignore - We're doing it properly
    lp.csx.lineCap = ["round", "square"][lp.f.r.hi(0, 1, "outline2 linecap")];
    lp.csx.strokeStyle = "#FFFFFF";
    for (var npi = 1; npi < pointcount; npi++) {
        var np = points[npi];
        if (np == null) {
            np = [
                lp.r.sd(0, 1) * innersize[0] + CANVAS_SHIP_EDGE,
                Math.pow(lp.r.sd(0, 1), lp.f.r.hd(0.1, 1, "outline2 frontbias")) *
                    innersize[1] +
                    CANVAS_SHIP_EDGE,
            ];
            points.push(np);
        }
        var cons = 1 + lp.r.sseq(lp.f.r.hd(0, 1, "outline2 conadjust"), 3);
        for (var nci = 0; nci < cons; nci++) {
            var pre = points[lp.r.si(0, points.length - 2)];
            lp.csx.lineWidth = lp.r.sd(0.7, 1) * basefatness * lp.size;
            lp.csx.beginPath();
            lp.csx.moveTo(pre[0], pre[1]);
            lp.csx.lineTo(np[0], np[1]);
            lp.csx.stroke();
            lp.csx.beginPath();
            lp.csx.moveTo(lp.w - pre[0], pre[1]);
            lp.csx.lineTo(lp.w - np[0], np[1]);
            lp.csx.stroke();
        }
    }
};

// CONCATENATED MODULE: ./src/ship.ts




class ship_Ship {
    constructor(p_faction, p_seed, size) {
        this.extradone = 0;
        this.nextpass = 0;
        this.nextcell = 0;
        this.totaldone = 0;
        this.f = p_faction;
        //Base seed for this ship, without appending the faction seed
        this.baseSeed = p_seed;
        this.seed = this.f.seed + this.baseSeed;
        this.r = new Randomizer(this.seed);
        //The initial overall size of this ship, in pixels
        this.size =
            size == null
                ? Math.pow(this.r.sd(this.f.r.hd(2.5, 3.5, "size min"), this.f.r.hd(5, 7, "size max")), 3)
                : size;
        const wratio = this.r.sd(this.f.r.hd(0.5, 1, "wratio min"), this.f.r.hd(1, 1.3, "wratio max"));
        const hratio = this.r.sd(this.f.r.hd(0.7, 1, "hratio min"), this.f.r.hd(1.1, 1.7, "hratio max"));
        this.w = Math.floor(this.size * wratio) + 2 * CANVAS_SHIP_EDGE; //Maximum width of this ship, in pixels.
        this.hw = Math.floor(this.w / 2);
        this.gw = Math.floor((this.w - 2 * CANVAS_SHIP_EDGE) / COMPONENT_GRID_SIZE);
        this.gwextra = (this.w - this.gw * COMPONENT_GRID_SIZE) * 0.5;
        this.h = Math.floor(this.size * hratio) + 2 * CANVAS_SHIP_EDGE; //Maximum height of this ship, in pixels.
        this.hh = Math.floor(this.h / 2);
        this.gh = Math.floor((this.h - 2 * CANVAS_SHIP_EDGE) / COMPONENT_GRID_SIZE);
        this.ghextra = (this.h - this.gh * COMPONENT_GRID_SIZE) * 0.5;
        this.cs = document.createElement("canvas"); //Canvas on which the basic outline of the ship is drawn. Ships face upwards, with front towards Y=0.
        this.cs.setAttribute("width", String(this.w));
        this.cs.setAttribute("height", String(this.h));
        this.csx = this.cs.getContext("2d");
        this.cf = document.createElement("canvas"); //Canvas on which the actual ship components are drawn. Ships face upwards, with front towards Y=0.
        this.cf.setAttribute("width", String(this.w));
        this.cf.setAttribute("height", String(this.h));
        this.cfx = this.cf.getContext("2d");
        outlines[this.f.r.hchoose([1, 1, 1], "outline type")](this);
        this.csd = this.csx.getImageData(0, 0, this.w, this.h);
        this.cgrid = [];
        for (let gx = 0; gx < this.gw; gx++) {
            this.cgrid[gx] = [];
            for (let gy = 0; gy < this.gh; gy++) {
                this.cgrid[gx][gy] = {
                    gx: gx,
                    gy: gy,
                    x: Math.floor(this.gwextra + (gx + 0.5) * COMPONENT_GRID_SIZE),
                    y: Math.floor(this.ghextra + (gy + 0.5) * COMPONENT_GRID_SIZE),
                    state: 0,
                }; //state is 0 for unchecked, 1 for checked and good, and -1 for checked and bad.
            }
        }
        this.goodcells = [
            this.cgrid[Math.floor(this.gw / 2)][Math.floor(this.gh / 2)],
        ];
        let nextcheck = 0;
        while (nextcheck < this.goodcells.length) {
            const lcell = this.goodcells[nextcheck];
            if (lcell.gx > 0) {
                const ncell = this.cgrid[lcell.gx - 1][lcell.gy];
                if (ncell.state == 0) {
                    if (this.getspa(ncell.x, ncell.y) > 0) {
                        ncell.state = 1;
                        this.goodcells.push(ncell);
                    }
                    else {
                        ncell.state = -1;
                    }
                }
            }
            if (lcell.gx < this.gw - 1) {
                const ncell = this.cgrid[lcell.gx + 1][lcell.gy];
                if (ncell.state == 0) {
                    if (this.getspa(ncell.x, ncell.y) > 0) {
                        ncell.state = 1;
                        this.goodcells.push(ncell);
                    }
                    else {
                        ncell.state = -1;
                    }
                }
            }
            if (lcell.gy > 0) {
                const ncell = this.cgrid[lcell.gx][lcell.gy - 1];
                if (ncell.state == 0) {
                    if (this.getspa(ncell.x, ncell.y) > 0) {
                        ncell.state = 1;
                        this.goodcells.push(ncell);
                    }
                    else {
                        ncell.state = -1;
                    }
                }
            }
            if (lcell.gy < this.gh - 1) {
                const ncell = this.cgrid[lcell.gx][lcell.gy + 1];
                if (ncell.state == 0) {
                    if (this.getspa(ncell.x, ncell.y) > 0) {
                        ncell.state = 1;
                        this.goodcells.push(ncell);
                    }
                    else {
                        ncell.state = -1;
                    }
                }
            }
            nextcheck++;
        }
        for (let i = 0; i < this.goodcells.length; i++) {
            const lcell = this.goodcells[i];
            const ocell = this.cgrid[this.gw - 1 - lcell.gx][lcell.gy];
            if (ocell.state != 1) {
                ocell.state = 1;
                this.goodcells.push(ocell);
            }
        }
        this.passes = this.f.r.hi(1, 2, "base component passes");
        this.extra = Math.max(1, Math.floor(this.goodcells.length *
            this.f.r.hd(0, 1 / this.passes, "extra component amount")));
        this.totalcomponents = this.passes * this.goodcells.length + this.extra;
    }
    // Returns the cell containing (X,Y), if there is one, or null otherwise
    getcell(x, y) {
        const gx = Math.floor((x - this.gwextra) / COMPONENT_GRID_SIZE);
        const gy = Math.floor((y - this.ghextra) / COMPONENT_GRID_SIZE);
        if (gx < 0 || gx >= this.gw || gy < 0 || gy >= this.gh) {
            return null;
        }
        return this.cgrid[gx][gy];
    }
    //Returns the state of the cell containing (X,Y), or 0 if there is no such cell
    getcellstate(x, y) {
        const lcell = this.getcell(x, y);
        if (lcell == null) {
            return 0;
        }
        return lcell.state;
    }
    //Returns the alpha value (0 - 255) for the pixel of csd corresponding to the point (X,Y), or -1 if (X,Y) is out of bounds.
    getspa(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (x < 0 || x > this.w || y < 0 || y > this.h) {
            return -1;
        }
        return this.csd.data[(y * this.w + x) * 4 + 3];
    }
    getpcdone() {
        return this.totaldone / this.totalcomponents;
    }
    addcomponent() {
        //Generates the next component of this ship. Returns true if the ship is finished, false if there are still more components to add.
        let ncell;
        if (this.nextpass < this.passes) {
            if (this.nextcell < this.goodcells.length) {
                ncell = this.goodcells[this.nextcell];
                this.nextcell++;
            }
            else {
                this.nextpass++;
                ncell = this.goodcells[0];
                this.nextcell = 1;
            }
        }
        else if (this.extradone < this.extra) {
            ncell = this.goodcells[this.r.si(0, this.goodcells.length - 1)];
            this.extradone++;
        }
        else {
            return true;
        }
        let lv = [ncell.x, ncell.y];
        for (let t = 0; t < 10; t++) {
            const nv = [
                ncell.x + this.r.si(-COMPONENT_GRID_SIZE, COMPONENT_GRID_SIZE),
                ncell.y + this.r.si(-COMPONENT_GRID_SIZE, COMPONENT_GRID_SIZE),
            ];
            if (nv[0] < CANVAS_SHIP_EDGE ||
                nv[0] > this.w - CANVAS_SHIP_EDGE ||
                nv[1] < CANVAS_SHIP_EDGE ||
                nv[1] > this.h - CANVAS_SHIP_EDGE) {
                continue;
            }
            if (this.getspa(nv[0], nv[1]) <= 0) {
                continue;
            }
            lv = nv;
            break;
        }
        if (Math.abs(lv[0] - this.hw) < COMPONENT_GRID_SIZE) {
            if (this.r.sb(this.f.r.hd(0, 1, "com middleness"))) {
                lv[0] = Math.floor(this.hw);
            }
        }
        components[this.r.schoose(this.f.componentChances)](this, lv);
        this.totaldone++;
        return false;
    }
}

// CONCATENATED MODULE: ./src/index.ts
//


const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const DEFAULT_SEED_LENGTH = 16;
// min and max included
function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function randomSeed() {
    var s = "";
    for (var c = 0; c < DEFAULT_SEED_LENGTH; c++) {
        s = s + characters[randomIntFromInterval(0, characters.length)];
    }
    return s;
}
function renderShip(lp) {
    var done = false;
    do {
        done = lp.addcomponent();
    } while (!done);
    lp.cfx.clearRect(lp.hw + (lp.w % 2), 0, lp.w, lp.h);
    lp.cfx.scale(-1, 1);
    lp.cfx.drawImage(lp.cf, 0 - lp.w, 0);
}
function generateShip() {
    const nfs = randomSeed();
    const sseed = randomSeed();
    const newShip = new ship_Ship(new faction_Faction(nfs), sseed, 100);
    renderShip(newShip);
    // currentship.cf has the canvas with the image
    // currentship.width
    // currentship.height
    return newShip.cf;
}


/***/ })
/******/ ]);
});