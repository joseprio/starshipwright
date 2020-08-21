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
__webpack_require__.d(__webpack_exports__, "newship", function() { return /* binding */ newship; });
__webpack_require__.d(__webpack_exports__, "newfaction", function() { return /* binding */ newfaction; });

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
        this.seed = seed;
        this.randomizer = new Randomizer(this.seed);
        this.cache = {}; //Data cache.
        this.setupComponentChances();
    }
    setupComponentChances() {
        this.componentChances = []; //Respective chances of each component.
        var dp = 8; //Default maximum power.
        this.componentChances[0] =
            0.8 *
                this.randomizer.sd(0.001, 1) *
                Math.pow(2, this.randomizer.sd(0, dp));
        this.componentChances[1] =
            0.9 *
                this.randomizer.sd(0.01, 1) *
                Math.pow(2, this.randomizer.sd(0, dp));
        this.componentChances[2] =
            1 * this.randomizer.sd(0.001, 1) * Math.pow(2, this.randomizer.sd(0, dp));
        this.componentChances[3] =
            3 * this.randomizer.sd(0, 1) * Math.pow(2, this.randomizer.sd(0, dp));
        this.componentChances[4] =
            0.5 * this.randomizer.sd(0, 1) * Math.pow(2, this.randomizer.sd(0, dp));
        this.componentChances[5] =
            0.05 * this.randomizer.sd(0, 1) * Math.pow(2, this.randomizer.sd(0, dp));
        this.componentChances[6] =
            0.5 * this.randomizer.sd(0, 1) * Math.pow(2, this.randomizer.sd(0, dp));
    }
    setupColors() {
        if (this.cache["base colors"] == null) {
            var dp = 6; //Default maximum power.
            this.cache["base color count"] =
                1 +
                    (this.randomizer.hb(0.7, "base color +1") ? 1 : 0) +
                    this.randomizer.hseq(0.3, 3, "base color count");
            this.cache["base colors"] = new Array(this.cache["base color count"]);
            this.cache["base color chances"] = new Array(this.cache["base color count"]);
            for (var i = 0; i < this.cache["base color count"]; i++) {
                var ls = "base color" + i;
                this.cache["base colors"][i] = hsvToRgb([
                    Math.pow(this.randomizer.hd(0, 1, ls + "hue"), 2),
                    clamp(this.randomizer.hd(-0.2, 1, ls + "saturation"), 0, Math.pow(this.randomizer.hd(0, 1, ls + "saturation bound"), 4)),
                    clamp(this.randomizer.hd(0.7, 1.1, ls + "value"), 0, 1),
                ]);
                this.cache["base color chances"][i] = Math.pow(2, this.randomizer.hd(0, dp, ls + "chances"));
            }
        }
        if (this.cache["window colors"] == null) {
            var dp = 5; //Default maximum power.
            this.cache["window color count"] =
                1 + (this.randomizer.hb(0.3, "window color +1") ? 1 : 0);
            this.cache["window colors"] = new Array(this.cache["window color count"]);
            this.cache["window color chances"] = new Array(this.cache["window color count"]);
            for (var i = 0; i < this.cache["window color count"]; i++) {
                var ls = "window color" + i;
                this.cache["window colors"][i] = hsvToRgb([
                    this.randomizer.hb(0.6, "window color blues only")
                        ? this.randomizer.hd(1 / 3, 3 / 4, "window color blue hue")
                        : this.randomizer.hd(0, 1, "window color hue"),
                    Math.pow(clamp(this.randomizer.hd(-0.2, 1.2, "window color hue"), 0, 1), 0.5),
                    Math.pow(clamp(this.randomizer.hd(0.4, 1.3, "window color value"), 0, 1), 0.5),
                ]);
                this.cache["window color chances"][i] = Math.pow(2, this.randomizer.hd(0, dp, ls + "chances"));
            }
        }
    }
    //Where lp is the ship to get the color for.
    getBaseColor(lp) {
        if (this.cache["base colors"] == null) {
            this.setupColors();
        }
        var rv = this.cache["base colors"][lp.r.schoose(this.cache["base color chances"])];
        if ( true &&
            lp.r.sb(this.cache["base color shift chance"] == null
                ? (this.cache["base color shift chance"] = Math.pow(this.randomizer.hd(0, 0.5, "base color shift chance"), 2))
                : this.cache["base color shift chance"])) {
            rv = [rv[0], rv[1], rv[2]];
            rv[0] = clamp(rv[0] +
                (this.cache["base color shift range red"] == null
                    ? (this.cache["base color shift range red"] = Math.pow(this.randomizer.hd(0, 0.6, "base color shift range red"), 2))
                    : this.cache["base color shift range red"]) *
                    clamp(lp.r.sd(-1, 1.2), 0, 1) *
                    clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1), 0, 1);
            rv[1] = clamp(rv[1] +
                (this.cache["base color shift range green"] == null
                    ? (this.cache["base color shift range green"] = Math.pow(this.randomizer.hd(0, 0.6, "base color shift range green"), 2))
                    : this.cache["base color shift range green"]) *
                    clamp(lp.r.sd(-1, 1.2), 0, 1) *
                    clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1), 0, 1);
            rv[2] = clamp(rv[2] +
                (this.cache["base color shift range blue"] == null
                    ? (this.cache["base color shift range blue"] = Math.pow(this.randomizer.hd(0, 0.6, "base color shift range blue"), 2))
                    : this.cache["base color shift range blue"]) *
                    clamp(lp.r.sd(-1, 1.2), 0, 1) *
                    clamp(lp.r.ss(0.7) + lp.r.ss(0.7), -1, 1), 0, 1);
        }
        return rv;
    }
    //Where lp is the ship to get the color for.
    getwindowcolor(lp) {
        if (this.cache["window colors"] == null) {
            this.setupColors();
        }
        var rv = this.cache["window colors"][lp.r.schoose(this.cache["window color chances"])];
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
function centerness(lp, v, do_x, do_y) {
    var rv = 1;
    if (do_x) {
        rv = Math.min(rv, 1 - Math.abs(v[0] - lp.hw) / lp.hw);
    }
    if (do_y) {
        rv = Math.min(rv, 1 - Math.abs(v[1] - lp.hh) / lp.hh);
    }
    return rv;
}
function bigness(lp, v) {
    var effect_center = centerness(lp, v, true, true);
    var effect_shipsize = 1 - 1 / ((lp.w + lp.h) / 1000 + 1);
    var effect_faction = Math.pow(lp.f.randomizer.hd(0, 1, "master bigness"), 0.5);
    var effect_stack = 1 - lp.getpcdone();
    return effect_center * effect_shipsize * effect_faction * effect_stack;
}
function leeway(lp, bb) {
    return [
        Math.min(bb[0][0] - CANVAS_SHIP_EDGE, lp.w - CANVAS_SHIP_EDGE - bb[1][0]),
        Math.min(bb[0][1] - CANVAS_SHIP_EDGE, lp.h - CANVAS_SHIP_EDGE - bb[1][1]),
    ];
}
function shadowcolor(amount) {
    //amount is the amount of shadow, 0 - 1.
    return "rgba(0,0,0," + clamp(amount, 0, 1) + ")";
}
function shadowgradient(lp, middlep, edgep, amount) {
    //lp is the ship. amount is the amount of shadow at the edges, 0 - 1 (the middle is always 0). middlep and edgep should be vectors at the middle and edge of the gradient.
    var grad = lp.cfx.createLinearGradient(edgep[0], edgep[1], middlep[0] * 2 - edgep[0], middlep[1] * 2 - edgep[1]);
    var darkness = shadowcolor(amount);
    grad.addColorStop(0, darkness);
    grad.addColorStop(0.5, "rgba(0,0,0,0)");
    grad.addColorStop(1, darkness);
    return grad;
}
const components = []; //Each component function takes an argument 'lp' (for the ship) and 'v' (an integral 2-vector denoting the center of the component).
components[0] = function (lp, v //Bordered block.
) {
    let lcms = COMPONENT_MAXIMUM_SIZE;
    var bn = Math.pow(bigness(lp, v), 0.3);
    if (lp.r.sb(lp.f.randomizer.hd(0, 0.9, "com0 bigchance")) * bn) {
        while (lp.r.sb((lp.f.cache["com0 bigincchance"] == null
            ? (lp.f.cache["com0 bigincchance"] = lp.f.randomizer.hd(0, 0.5, "com0 bigincchance"))
            : lp.f.cache["com0 bigincchance"]) * bn)) {
            var lw = leeway(lp, [
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
    var lcms2 = lcms * 2;
    var dhi = [
        Math.ceil(lp.r.sd(1, Math.max(2, 0.5 * lcms))),
        Math.ceil(lp.r.sd(1, Math.max(2, 0.5 * lcms))),
    ];
    var borderwidth = Math.min(dhi[0], dhi[1]) * lp.r.sd(0.1, 1.2);
    var dho = [dhi[0] + borderwidth * 2, dhi[1] + borderwidth * 2];
    var counts = [Math.ceil(lcms2 / dho[0]), Math.ceil(lcms2 / dho[1])];
    var trv = [
        Math.round((counts[0] * dho[0]) / 2),
        Math.round((counts[1] * dho[1]) / 2),
    ];
    var pcdone = lp.getpcdone();
    var basecolor = lp.f.getBaseColor(lp);
    var icolorh = colorToHex(scaleColorBy(basecolor, lp.r.sd(0.4, 1)));
    var ocolorh = colorToHex(scaleColorBy(basecolor, lp.r.sd(0.4, 1)));
    lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.25) + ")";
    lp.cfx.fillRect(v[0] - trv[0] - 1, v[1] - trv[1] - 1, dho[0] * counts[0] + 2, dho[1] * counts[1] + 2);
    lp.cfx.fillStyle = ocolorh;
    lp.cfx.fillRect(v[0] - trv[0], v[1] - trv[1], dho[0] * counts[0], dho[1] * counts[1]);
    lp.cfx.fillStyle = icolorh;
    for (var x = 0; x < counts[0]; x++) {
        var bx = v[0] + borderwidth + x * dho[0] - trv[0];
        for (var y = 0; y < counts[1]; y++) {
            var by = v[1] + borderwidth + y * dho[1] - trv[1];
            lp.cfx.fillRect(bx, by, dhi[0], dhi[1]);
        }
    }
    if (lp.r.sb(clamp((pcdone * 0.6 + 0.3) * (lcms / COMPONENT_MAXIMUM_SIZE), 0, 0.98))) {
        lp.cfx.fillStyle = shadowgradient(lp, v, [v[0] + trv[0], v[1]], lp.r.sd(0, 0.9));
        lp.cfx.fillRect(v[0] - trv[0], v[1] - trv[1], dho[0] * counts[0], dho[1] * counts[1]);
    }
};
components[1] = function (lp, v //Cylinder array
) {
    var lcms = COMPONENT_MAXIMUM_SIZE;
    var bn = Math.pow(bigness(lp, v), 0.2);
    if (lp.r.sb((lp.f.cache["com1 bigchance"] == null
        ? (lp.f.cache["com1 bigchance"] = lp.f.randomizer.hd(0.3, 1, "com1 bigchance"))
        : lp.f.cache["com1 bigchance"]) * bn)) {
        while (lp.r.sb((lp.f.cache["com1 bigincchance"] == null
            ? (lp.f.cache["com1 bigincchance"] = lp.f.randomizer.hd(0, 0.6, "com1 bigincchance"))
            : lp.f.cache["com1 bigincchance"]) * bn)) {
            var lw = leeway(lp, [
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
    var w = Math.ceil(lp.r.sd(0.8, 2) * lcms);
    var h = Math.ceil(lp.r.sd(0.8, 2) * lcms);
    var cw = lp.r.si(3, Math.max(4, w));
    var count = Math.max(1, Math.round(w / cw));
    w = count * cw;
    var basecolor = lp.f.getBaseColor(lp);
    var ccolor = colorToHex(scaleColorBy(basecolor, lp.r.sd(0.5, 1)));
    var darkness = lp.r.sd(0.3, 0.9);
    var orientation = lp.r.sb(lp.f.cache["com1 hchance"] == null
        ? (lp.f.cache["com1 hchance"] = clamp(lp.f.randomizer.hd(-0.2, 1.2, "com1 hchance"), 0, 1))
        : lp.f.cache["com1 hchance"]); //true = horizontal array, false = vertical array.
    if (orientation) {
        var bv = [v[0] - Math.floor(w / 2), v[1] - Math.floor(h / 2)];
        lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.25) + ")";
        lp.cfx.fillRect(bv[0] - 1, bv[1] - 1, w + 2, h + 2);
        lp.cfx.fillStyle = ccolor;
        lp.cfx.fillRect(bv[0], bv[1], w, h);
        for (var i = 0; i < count; i++) {
            lp.cfx.fillStyle = shadowgradient(lp, [bv[0] + (i + 0.5) * cw, v[1]], [bv[0] + i * cw, v[1]], darkness);
            lp.cfx.fillRect(bv[0] + i * cw, bv[1], cw, h);
        }
    }
    else {
        var bv = [v[0] - Math.floor(h / 2), v[1] - Math.floor(w / 2)];
        lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.25) + ")";
        lp.cfx.fillRect(bv[0] - 1, bv[1] - 1, h + 2, w + 2);
        lp.cfx.fillStyle = ccolor;
        lp.cfx.fillRect(bv[0], bv[1], h, w);
        for (var i = 0; i < count; i++) {
            lp.cfx.fillStyle = shadowgradient(lp, [v[0], bv[1] + (i + 0.5) * cw], [v[0], bv[1] + i * cw], darkness);
            lp.cfx.fillRect(bv[0], bv[1] + i * cw, w, cw);
        }
    }
};
components[2] = function (lp, v //Banded cylinder
) {
    let lcms = COMPONENT_MAXIMUM_SIZE;
    var bn = Math.pow(bigness(lp, v), 0.05);
    if (lp.r.sb((lp.f.cache["com2 bigchance"] == null
        ? (lp.f.cache["com2 bigchance"] = lp.f.randomizer.hd(0, 1, "com2 bigchance"))
        : lp.f.cache["com2 bigchance"]) * bn)) {
        while (lp.r.sb((lp.f.cache["com2 bigincchance"] == null
            ? (lp.f.cache["com2 bigincchance"] = lp.f.randomizer.hd(0, 0.9, "com2 bigincchance"))
            : lp.f.cache["com2 bigincchance"]) * bn)) {
            var lw = leeway(lp, [
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
    var w = Math.ceil(lp.r.sd(0.6, 1.4) * lcms);
    var h = Math.ceil(lp.r.sd(1, 2) * lcms);
    var wh2 = [
        Math.ceil(clamp((w * lp.r.sd(0.7, 1)) / 2, 1, w)),
        Math.ceil(clamp((w * lp.r.sd(0.8, 1)) / 2, 1, w)),
    ];
    var h2 = [
        Math.floor(clamp(w * lp.r.sd(0.05, 0.25), 1, h)),
        Math.floor(clamp(w * lp.r.sd(0.1, 0.3), 1, h)),
    ];
    var hpair = h2[0] + h2[1];
    var odd = lp.r.sb(lp.f.cache["com2 oddchance"] == null
        ? (lp.f.cache["com2 oddchance"] = Math.pow(lp.f.randomizer.hd(0, 1, "com2 oddchance"), 0.5))
        : lp.f.cache["com2 oddchance"]);
    var count = clamp(Math.floor(h / hpair), 1, h);
    var htotal = count * hpair + (odd ? h2[0] : 0);
    var basecolor = lp.f.getBaseColor(lp);
    var color2 = [
        scaleColorBy(basecolor, lp.r.sd(0.6, 1)),
        scaleColorBy(basecolor, lp.r.sd(0.6, 1)),
    ];
    var darkness = lp.r.sd(0.5, 0.95);
    var lightness = 1 - darkness;
    var colord2 = [
        scaleColorBy(color2[0], lightness),
        scaleColorBy(color2[1], lightness),
    ];
    var orientation = lp.r.sb(lp.f.cache["com2 verticalchance"] == null
        ? (lp.f.cache["com2 verticalchance"] = Math.pow(lp.f.randomizer.hd(0, 1, "com2 verticalchance"), 0.1))
        : lp.f.cache["com2 verticalchance"]);
    if (orientation) {
        var grad2 = [
            lp.cfx.createLinearGradient(v[0] - wh2[0], v[1], v[0] + wh2[0], v[1]),
            lp.cfx.createLinearGradient(v[0] - wh2[1], v[1], v[0] + wh2[1], v[1]),
        ];
        grad2[0].addColorStop(0, colorToHex(colord2[0]));
        grad2[0].addColorStop(0.5, colorToHex(color2[0]));
        grad2[0].addColorStop(1, colorToHex(colord2[0]));
        grad2[1].addColorStop(0, colorToHex(colord2[1]));
        grad2[1].addColorStop(0.5, colorToHex(color2[1]));
        grad2[1].addColorStop(1, colorToHex(colord2[1]));
        var by = Math.floor(v[1] - htotal / 2);
        for (var i = 0; i < count; i++) {
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
        var grad2 = [
            lp.cfx.createLinearGradient(v[0], v[1] - wh2[0], v[0], v[1] + wh2[0]),
            lp.cfx.createLinearGradient(v[0], v[1] - wh2[1], v[0], v[1] + wh2[1]),
        ];
        grad2[0].addColorStop(0, colorToHex(colord2[0]));
        grad2[0].addColorStop(0.5, colorToHex(color2[0]));
        grad2[0].addColorStop(1, colorToHex(colord2[0]));
        grad2[1].addColorStop(0, colorToHex(colord2[1]));
        grad2[1].addColorStop(0.5, colorToHex(color2[1]));
        grad2[1].addColorStop(1, colorToHex(colord2[1]));
        var bx = Math.floor(v[0] - htotal / 2);
        for (var i = 0; i < count; i++) {
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
components[3] = function (lp, v //Rocket engine (or tries to call another random component if too far forward)
) {
    if (lp.r.sb(frontness(lp, v) - 0.3) ||
        lp.getcellstate(v[0], v[1] + COMPONENT_GRID_SIZE * 1.2) > 0 ||
        lp.getcellstate(v[0], v[1] + COMPONENT_GRID_SIZE * 1.8) > 0) {
        for (var tries = 0; tries < 100; tries++) {
            var which = lp.r.schoose(lp.f.componentChances);
            if (which != 3) {
                components[which](lp, v);
                return;
            }
        }
    }
    let lcms = COMPONENT_MAXIMUM_SIZE;
    var bn = Math.pow(bigness(lp, v), 0.1);
    if (lp.r.sb((lp.f.cache["com3 bigchance"] == null
        ? (lp.f.cache["com3 bigchance"] = lp.f.randomizer.hd(0.6, 1, "com3 bigchance"))
        : lp.f.cache["com3 bigchance"]) * bn)) {
        while (lp.r.sb((lp.f.cache["com3 bigincchance"] == null
            ? (lp.f.cache["com3 bigincchance"] = lp.f.randomizer.hd(0.3, 0.8, "com3 bigincchance"))
            : lp.f.cache["com3 bigincchance"]) * bn)) {
            var lw = leeway(lp, [
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
    var w = lp.r.sd(1, 2) * lcms;
    var h = Math.ceil(lp.r.sd(0.3, 1) * lcms);
    var nratio = lp.r.sd(0.25, 0.6);
    var nw = w * nratio;
    var midw = (w + nw) / 2;
    var midwh = midw / 2;
    var h2 = [
        Math.max(1, Math.ceil(h * lp.r.sd(0.08, 0.25))),
        Math.max(1, Math.ceil(h * lp.r.sd(0.03, 0.15))),
    ];
    var hpair = h2[0] + h2[1];
    var count = Math.ceil(h / hpair);
    h = count * hpair + h2[0];
    lp.f.setupColors();
    var basecolor = lp.f.cache["base colors"][lp.f.cache["com3 basecolor"] == null
        ? (lp.f.cache["com3 basecolor"] = lp.f.randomizer.hchoose(lp.f.cache["base color chances"], "com3 basecolor"))
        : lp.f.cache["com3 basecolor"]];
    var lightness0_mid = lp.f.cache["com3 lightness0 mid"] == null
        ? (lp.f.cache["com3 lightness0 mid"] = lp.f.randomizer.hd(0.5, 0.8, "com3 lightness0 mid"))
        : lp.f.cache["com3 lightness0 mid"];
    var lightness0_edge = lightness0_mid -
        (lp.f.cache["com3 lightness0 edge"] == null
            ? (lp.f.cache["com3 lightness0 edge"] = lp.f.randomizer.hd(0.2, 0.4, "com3 lightness0 edge"))
            : lp.f.cache["com3 lightness0 edge"]);
    var lightness1_edge = lp.f.cache["com3 lightness1 edge"] == null
        ? (lp.f.cache["com3 lightness1 edge"] = lp.f.randomizer.hd(0, 0.2, "com3 lightness1 edge"))
        : lp.f.cache["com3 lightness1 edge"];
    var grad2 = [
        lp.cfx.createLinearGradient(v[0] - midwh, v[1], v[0] + midwh, v[1]),
        lp.cfx.createLinearGradient(v[0] - midwh, v[1], v[0] + midwh, v[1]),
    ];
    grad2[0].addColorStop(0, colorToHex(scaleColorBy(basecolor, lightness0_edge)));
    grad2[0].addColorStop(0.5, colorToHex(scaleColorBy(basecolor, lightness0_mid)));
    grad2[0].addColorStop(1, colorToHex(scaleColorBy(basecolor, lightness0_edge)));
    grad2[1].addColorStop(0, colorToHex(scaleColorBy(basecolor, lightness1_edge)));
    grad2[1].addColorStop(0.5, colorToHex(basecolor));
    grad2[1].addColorStop(1, colorToHex(scaleColorBy(basecolor, lightness1_edge)));
    var by = Math.ceil(v[1] - h / 2);
    lp.cfx.fillStyle = grad2[0];
    lp.cfx.beginPath();
    lp.cfx.moveTo(v[0] - nw / 2, by);
    lp.cfx.lineTo(v[0] + nw / 2, by);
    lp.cfx.lineTo(v[0] + w / 2, by + h);
    lp.cfx.lineTo(v[0] - w / 2, by + h);
    lp.cfx.fill();
    lp.cfx.fillStyle = grad2[1];
    var byh = [by + h2[0], by + hpair];
    for (var i = 0; i < count; i++) {
        var lyr = [i * hpair + h2[0], (i + 1) * hpair];
        var ly = [byh[0] + i * hpair, byh[1] + i * hpair];
        var lw = [
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
components[4] = function (lp, v //Elongated cylinder (calls component 0 - 2 on top of its starting point)
) {
    var cn = centerness(lp, v, true, false);
    var lightmid = lp.r.sd(0.7, 1);
    var lightedge = lp.r.sd(0, 0.2);
    var basecolor = lp.f.getBaseColor(lp);
    var colormid = colorToHex(scaleColorBy(basecolor, lightmid));
    var coloredge = colorToHex(scaleColorBy(basecolor, lightedge));
    if (lp.f.cache["com4 directionc"] == null) {
        lp.f.cache["com4 directionc"] = [
            1 * Math.pow(lp.f.randomizer.hd(0, 1, "com4 directionc0"), 4),
            0.1 * Math.pow(lp.f.randomizer.hd(0, 1, "com4 directionc1"), 4),
            0.2 * Math.pow(lp.f.randomizer.hd(0, 1, "com4 directionc2"), 4),
        ];
    }
    var w = Math.max(3, Math.ceil(lp.size *
        Math.pow(lp.r.sd(0.4, 1), 2) *
        (lp.f.cache["com4 maxwidth"] == null
            ? (lp.f.cache["com4 maxwidth"] = lp.f.randomizer.hd(0.02, 0.1, "com4 maxwidth"))
            : lp.f.cache["com4 maxwidth"])));
    var hwi = Math.floor(w / 2);
    var hwe = w % 2;
    var direction = lp.r.schoose([
        lp.f.cache["com4 directionc"][0] * (2 - cn),
        lp.f.cache["com4 directionc"][1],
        lp.f.cache["com4 directionc"][2] * (1 + cn),
    ]);
    var ev = null;
    if (direction == 0) {
        //forwards
        var hlimit = v[1] - CANVAS_SHIP_EDGE;
        var h = Math.min(Math.max(COMPONENT_MAXIMUM_SIZE, hlimit - lp.r.si(0, COMPONENT_MAXIMUM_SIZE * 2)), Math.floor(0.7 *
            lp.size *
            Math.pow(lp.r.sd(0, 1), lp.f.cache["com4 hpower0"] == null
                ? (lp.f.cache["com4 hpower0"] = lp.f.randomizer.hd(2, 6, "com4 hpower0"))
                : lp.f.cache["com4 hpower0"])));
        var bb = [
            [v[0] - hwi, v[1] - h],
            [v[0] + hwi + hwe, v[1]],
        ];
        var grad = lp.cfx.createLinearGradient(bb[0][0], bb[0][1], bb[1][0], bb[0][1]);
        grad.addColorStop(0, coloredge);
        grad.addColorStop(0.5, colormid);
        grad.addColorStop(1, coloredge);
        lp.cfx.fillStyle = grad;
        lp.cfx.fillRect(bb[0][0], bb[0][1], w, h);
        ev = [v[0], v[1] - h];
    }
    else if (direction == 1) {
        //backwards
        var hlimit = lp.h - (CANVAS_SHIP_EDGE + v[1]);
        var h = Math.min(Math.max(COMPONENT_MAXIMUM_SIZE, hlimit - lp.r.si(0, COMPONENT_MAXIMUM_SIZE * 2)), Math.floor(0.6 *
            lp.size *
            Math.pow(lp.r.sd(0, 1), lp.f.cache["com4 hpower1"] == null
                ? (lp.f.cache["com4 hpower1"] = lp.f.randomizer.hd(2, 7, "com4 hpower1"))
                : lp.f.cache["com4 hpower1"])));
        var bb = [
            [v[0] - hwi, v[1]],
            [v[0] + hwi + hwe, v[1] + h],
        ];
        var grad = lp.cfx.createLinearGradient(bb[0][0], bb[0][1], bb[1][0], bb[0][1]);
        grad.addColorStop(0, coloredge);
        grad.addColorStop(0.5, colormid);
        grad.addColorStop(1, coloredge);
        lp.cfx.fillStyle = grad;
        lp.cfx.fillRect(bb[0][0], bb[0][1], w, h);
        ev = [v[0], v[1] + h];
    }
    else if (direction == 2) {
        //to center
        var grad = lp.cfx.createLinearGradient(v[0], v[1] - hwi, v[0], v[1] + hwi + hwe);
        grad.addColorStop(0, coloredge);
        grad.addColorStop(0.5, colormid);
        grad.addColorStop(1, coloredge);
        lp.cfx.fillStyle = grad;
        lp.cfx.fillRect(v[0], v[1] - hwi, Math.ceil(lp.hw - v[0]) + 1, w);
        ev = [Math.floor(lp.hw), v[1] + h];
    }
    if (lp.f.cache["com4 covercomc"] == null) {
        lp.f.cache["com4 covercomc"] = [
            0.6 * Math.pow(lp.f.randomizer.hd(0, 1, "com4 covercomc0"), 2),
            0.2 * Math.pow(lp.f.randomizer.hd(0, 1, "com4 covercomc1"), 2),
            1 * Math.pow(lp.f.randomizer.hd(0, 1, "com4 covercomc2"), 2),
        ];
    }
    components[lp.r.schoose(lp.f.cache["com4 covercomc"])](lp, v);
    if (lp.getcellstate(ev[0], ev[1]) > 0) {
        var nev = [
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
components[5] = function (lp, v //Ball
) {
    let lcms = COMPONENT_MAXIMUM_SIZE;
    var bn = Math.pow(bigness(lp, v), 0.1);
    if (lp.r.sb((lp.f.cache["com5 bigchance"] == null
        ? (lp.f.cache["com5 bigchance"] = lp.f.randomizer.hd(0, 0.9, "com5 bigchance"))
        : lp.f.cache["com5 bigchance"]) * bn)) {
        while (lp.r.sb((lp.f.cache["com5 bigincchance"] == null
            ? (lp.f.cache["com5 bigincchance"] = lp.f.randomizer.hd(0, 0.8, "com5 bigincchance"))
            : lp.f.cache["com5 bigincchance"]) * bn)) {
            var lw = leeway(lp, [
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
    var lightmid = lp.r.sd(0.75, 1);
    var lightedge = lp.r.sd(0, 0.25);
    var basecolor = lp.f.getBaseColor(lp);
    var colormid = colorToHex(scaleColorBy(basecolor, lightmid));
    var coloredge = colorToHex(scaleColorBy(basecolor, lightedge));
    var countx = 1 +
        lp.r.sseq(lp.f.cache["com5 multxc"] == null
            ? (lp.f.cache["com5 multxc"] = lp.f.randomizer.hd(0, 1, "com5 multxc"))
            : lp.f.cache["com5 multxc"], Math.floor(1.2 * Math.pow(lcms / COMPONENT_MAXIMUM_SIZE, 0.6)));
    var county = 1 +
        lp.r.sseq(lp.f.cache["com5 multyc"] == null
            ? (lp.f.cache["com5 multyc"] = lp.f.randomizer.hd(0, 1, "com5 multyc"))
            : lp.f.cache["com5 multyc"], Math.floor(1.2 * Math.pow(lcms / COMPONENT_MAXIMUM_SIZE, 0.6)));
    var smallr = (lp.r.sd(0.5, 1) * lcms) / Math.max(countx, county);
    var drawr = smallr + 0.5;
    var shadowr = smallr + 1;
    var centerr = smallr * 0.2;
    var hw = smallr * countx;
    var hh = smallr * county;
    var bv = [v[0] - hw, v[1] - hh];
    lp.cfx.fillStyle = "rgba(0,0,0," + lp.r.sd(0, 0.2) + ")";
    for (var ax = 0; ax < countx; ax++) {
        var px = bv[0] + (ax * 2 + 1) * smallr;
        for (var ay = 0; ay < county; ay++) {
            var py = bv[1] + (ay * 2 + 1) * smallr;
            lp.cfx.beginPath();
            lp.cfx.arc(px, py, shadowr, 0, 2 * Math.PI);
            lp.cfx.fill();
        }
    }
    for (var ax = 0; ax < countx; ax++) {
        var px = bv[0] + (ax * 2 + 1) * smallr;
        for (var ay = 0; ay < county; ay++) {
            var py = bv[1] + (ay * 2 + 1) * smallr;
            var grad = lp.cfx.createRadialGradient(px, py, centerr, px, py, drawr);
            grad.addColorStop(0, colormid);
            grad.addColorStop(1, coloredge);
            lp.cfx.fillStyle = grad;
            lp.cfx.beginPath();
            lp.cfx.arc(px, py, drawr, 0, 2 * Math.PI);
            lp.cfx.fill();
        }
    }
};
components[6] = function (lp, v //Forward-facing trapezoidal fin
) {
    if (lp.nextpass <= 0 || lp.r.sb(frontness(lp, v))) {
        components[lp.r.schoose(copyArray(lp.f.componentChances, 0, 5))](lp, v);
        return;
    }
    let lcms = COMPONENT_MAXIMUM_SIZE;
    var bn = Math.pow(bigness(lp, v), 0.05);
    if (lp.r.sb((lp.f.cache["com6 bigchance"] == null
        ? (lp.f.cache["com6 bigchance"] = lp.f.randomizer.hd(0, 0.9, "com6 bigchance"))
        : lp.f.cache["com6 bigchance"]) * bn)) {
        while (lp.r.sb((lp.f.cache["com6 bigincchance"] == null
            ? (lp.f.cache["com6 bigincchance"] = lp.f.randomizer.hd(0, 0.8, "com6 bigincchance"))
            : lp.f.cache["com6 bigincchance"]) * bn)) {
            var lw = leeway(lp, [
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
    var h0 = Math.ceil(lcms * 2 * lp.r.sd(0.6, 1)); //Inner height, longer.
    var hh0i = Math.floor(h0 / 2);
    var hh0e = h0 % 2;
    var h1 = h0 *
        Math.pow(lp.r.sd(lp.f.cache["com6 h1min"] == null
            ? (lp.f.cache["com6 h1min"] = Math.pow(lp.f.randomizer.hd(0, 0.8, "com6 h1min"), 0.5))
            : lp.f.cache["com6 h1min"], 0.9), lp.f.cache["com6 h1power"] == null
            ? (lp.f.cache["com6 h1power"] = lp.f.randomizer.hd(0.5, 1.5, "com6 h1power"))
            : lp.f.cache["com6 h1power"]); //Outer height, shorter.
    var hh1i = Math.floor(h1 / 2);
    var hh1e = h0 % 2;
    var backamount = Math.max(0 - (h0 - h1) / 2, h0 *
        (lp.r.sd(0, 0.45) + lp.r.sd(0, 0.45)) *
        (lp.f.cache["com6 backness"] == null
            ? (lp.f.cache["com6 backness"] = lp.f.randomizer.hb(0.8, "com6 backnesstype")
                ? lp.f.randomizer.hd(0.2, 0.9, "com6 backness#pos")
                : lp.f.randomizer.hd(-0.2, -0.05, "com6 backness#neg"))
            : lp.f.cache["com6 backness"]));
    var w = Math.ceil(lcms *
        lp.r.sd(0.7, 1) *
        (lp.f.cache["com6 width"] == null
            ? (lp.f.cache["com6 width"] = Math.pow(lp.f.randomizer.hd(0.1, 3.5, "com6 width"), 0.5))
            : lp.f.cache["com6 width"]));
    var hwi = Math.floor(w / 2);
    var hwe = w % 2;
    var quad = [
        [v[0] - hwi, v[1] + backamount - hh1i],
        [v[0] + hwi + hwe, v[1] - hh0i],
        [v[0] + hwi + hwe, v[1] + hh0i + hh0e],
        [v[0] - hwi, v[1] + backamount + hh1i + hh1e],
    ];
    var basecolor = lp.f.getBaseColor(lp);
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
        ? (lp.f.cache["com7 bigchance"] = lp.f.randomizer.hd(0, 0.9, "com7 bigchance"))
        : lp.f.cache["com7 bigchance"]) * bn
    )
  ) {
    while (
      lp.r.sb(
        (lp.f.cache["com7 bigincchance"] == null
          ? (lp.f.cache["com7 bigincchance"] = lp.f.randomizer.hd(
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
      ? (lp.f.cache["com7 height"] = lp.f.randomizer.hd(0.5, 1, "com7 height"))
      : lp.f.cache["com7 height"]);
  var hh = h / 2;
  var w =
    1 +
    h *
      (lp.f.cache["com7 width"] == null
        ? (lp.f.cache["com7 width"] = lp.f.randomizer.hd(0.3, 0.8, "com7 width"))
        : lp.f.cache["com7 width"]);
  var hw = w / 2;
  var windowcolor = lp.f.getwindowcolor(lp);
  var lightness0 = lp.r.sd(0.7, 0.9);
  var lightness1 = lp.r.sd(0.4, 0.6);
  var color0 = scaleColorBy(windowcolor, lightness0);
  var color1 = scaleColorBy(windowcolor, lightness1);
  var transparency =
    lp.f.cache["com7 transparency"] == null
      ? (lp.f.cache["com7 transparency"] = lp.f.randomizer.hd(0.3, 0.5, "com7 transparency"))
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
    var initialwidth = Math.ceil((lp.w - 2 * CANVAS_SHIP_EDGE) *
        (lp.f.cache["outline0 iw"] == null
            ? (lp.f.cache["outline0 iw"] = lp.f.randomizer.hd(0.1, 1, "outline0 iw"))
            : lp.f.cache["outline0 iw"]) *
        0.2);
    var blocks = [
        [
            [lp.hw - initialwidth, CANVAS_SHIP_EDGE],
            [lp.hw + initialwidth, lp.h - CANVAS_SHIP_EDGE],
        ],
    ];
    if (lp.f.cache["outline0 bc"] == null) {
        lp.f.cache["outline0 bc"] = lp.f.randomizer.hd(2, 8, "outline0 bc");
    }
    var blockcount = 2 +
        Math.floor(lp.r.sd(0.5, 1) * lp.f.cache["outline0 bc"] * Math.sqrt(lp.size));
    for (var i = 1; i < blockcount; i++) {
        var base = blocks[lp.r.si(0, blocks.length - 1)];
        var v0 = [
            base[0][0] + lp.r.sd(0, 1) * (base[1][0] - base[0][0]),
            base[0][1] + lp.r.sd(0, 1) * (base[1][1] - base[0][1]),
        ];
        if (v0[1] < (base[0][1] + base[1][1]) * 0.5 &&
            lp.r.sb(lp.f.cache["outline0 frontbias"] == null
                ? (lp.f.cache["outline0 frontbias"] = lp.f.randomizer.hd(0.5, 1.5, "outline0 frontbias"))
                : lp.f.cache["outline0 frontbias"])) {
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
    var initialwidth = Math.ceil((lp.w - 2 * CANVAS_SHIP_EDGE) *
        (lp.f.cache["outline1 iw"] == null
            ? (lp.f.cache["outline1 iw"] = lp.f.randomizer.hd(0.1, 1, "outline1 iw"))
            : lp.f.cache["outline1 iw"]) *
        0.2);
    var circles = [];
    var initialcount = Math.floor((lp.h - 2 * CANVAS_SHIP_EDGE) / (initialwidth * 2));
    for (var i = 0; i < initialcount; i++) {
        let lv = [lp.hw, lp.h - (CANVAS_SHIP_EDGE + initialwidth * (i * 2 + 1))];
        circles.push({ v: lv, r: initialwidth });
    }
    if (lp.f.cache["outline1 cc"] == null) {
        lp.f.cache["outline1 cc"] = lp.f.randomizer.hd(10, 50, "outline1 cc");
    }
    var circlecount = initialcount +
        Math.floor(lp.r.sd(0.5, 1) * lp.f.cache["outline1 cc"] * Math.sqrt(lp.size));
    for (var i = initialcount; i < circlecount; i++) {
        var base = circles[Math.max(lp.r.si(0, circles.length - 1), lp.r.si(0, circles.length - 1))];
        var ncr = lp.r.sd(1, csrlimit);
        var pr = lp.r.sd(Math.max(0, base.r - ncr), base.r);
        var pa = lp.r.sd(0, 2 * Math.PI);
        if (pa > Math.PI &&
            lp.r.sb(lp.f.cache["outline1 frontbias"] == null
                ? (lp.f.cache["outline1 frontbias"] = lp.f.randomizer.hd(0.5, 1.5, "outline1 frontbias"))
                : lp.f.cache["outline1 frontbias"])) {
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
        (lp.f.cache["outline2 basefatness"] == null
            ? (lp.f.cache["outline2 basefatness"] = lp.f.randomizer.hd(0.03, 0.1, "outline2 basefatness"))
            : lp.f.cache["outline2 basefatness"]);
    var basemessiness = 1 / basefatness;
    var pointcount = Math.max(3, Math.ceil(basemessiness * lp.r.sd(0.05, 0.1) * Math.sqrt(lp.size)));
    // @ts-ignore - We're doing it properly
    lp.csx.lineCap = ["round", "square"][lp.f.cache["outline2 linecap"] == null
        ? (lp.f.cache["outline2 linecap"] = lp.f.randomizer.hi(0, 1, "outline2 linecap"))
        : lp.f.cache["outline2 linecap"]];
    lp.csx.strokeStyle = "#FFFFFF";
    for (var npi = 1; npi < pointcount; npi++) {
        var np = points[npi];
        if (np == null) {
            np = [
                lp.r.sd(0, 1) * innersize[0] + CANVAS_SHIP_EDGE,
                Math.pow(lp.r.sd(0, 1), lp.f.cache["outline2 frontbias"] == null
                    ? (lp.f.cache["outline2 frontbias"] = lp.f.randomizer.hd(0.1, 1, "outline2 frontbias"))
                    : lp.f.cache["outline2 frontbias"]) *
                    innersize[1] +
                    CANVAS_SHIP_EDGE,
            ];
            points.push(np);
        }
        var cons = 1 +
            lp.r.sseq(lp.f.cache["outline2 conadjust"] == null
                ? (lp.f.cache["outline2 conadjust"] = lp.f.randomizer.hd(0, 1, "outline2 conadjust"))
                : lp.f.cache["outline2 conadjust"], 3);
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
    constructor(p_faction, p_seed) {
        this.extradone = 0;
        this.nextpass = 0;
        this.nextcell = 0;
        this.totaldone = 0;
        this.f = p_faction;
        this.baseSeed = p_seed; //Base seed for this ship, without appending the faction seed.
        this.seed = this.f.seed + this.baseSeed;
        this.r = new Randomizer(this.seed);
        //this.c = []; //Data cache.
        this.size = Math.pow(this.r.sd(this.f.randomizer.hd(2.5, 3.5, "size min"), this.f.randomizer.hd(5, 7, "size max")), 3); //The initial overall size of this ship, in pixels.
        const wratio = this.r.sd(this.f.randomizer.hd(0.5, 1, "wratio min"), this.f.randomizer.hd(1, 1.3, "wratio max"));
        const hratio = this.r.sd(this.f.randomizer.hd(0.7, 1, "hratio min"), this.f.randomizer.hd(1.1, 1.7, "hratio max"));
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
        outlines[this.f.randomizer.hchoose([1, 1, 1], "outline type")](this);
        this.csd = this.csx.getImageData(0, 0, this.w, this.h);
        this.cgrid = [];
        for (var gx = 0; gx < this.gw; gx++) {
            this.cgrid[gx] = [];
            for (var gy = 0; gy < this.gh; gy++) {
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
        var nextcheck = 0;
        while (nextcheck < this.goodcells.length) {
            var lcell = this.goodcells[nextcheck];
            if (lcell.gx > 0) {
                var ncell = this.cgrid[lcell.gx - 1][lcell.gy];
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
                var ncell = this.cgrid[lcell.gx + 1][lcell.gy];
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
                var ncell = this.cgrid[lcell.gx][lcell.gy - 1];
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
                var ncell = this.cgrid[lcell.gx][lcell.gy + 1];
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
        for (var i = 0; i < this.goodcells.length; i++) {
            var lcell = this.goodcells[i];
            var ocell = this.cgrid[this.gw - 1 - lcell.gx][lcell.gy];
            if (ocell.state != 1) {
                ocell.state = 1;
                this.goodcells.push(ocell);
            }
        }
        this.passes = this.f.randomizer.hi(1, 2, "base component passes");
        this.extra = Math.max(1, Math.floor(this.goodcells.length *
            this.f.randomizer.hd(0, 1 / this.passes, "extra component amount")));
        this.totalcomponents = this.passes * this.goodcells.length + this.extra;
    }
    // Returns the cell containing (X,Y), if there is one, or null otherwise
    getcell(x, y) {
        var gx = Math.floor((x - this.gwextra) / COMPONENT_GRID_SIZE);
        var gy = Math.floor((y - this.ghextra) / COMPONENT_GRID_SIZE);
        if (gx < 0 || gx >= this.gw || gy < 0 || gy >= this.gh) {
            return null;
        }
        return this.cgrid[gx][gy];
    }
    getcellstate(x, y //Returns the state of the cell containing (X,Y), or 0 if there is no such cell.
    ) {
        var lcell = this.getcell(x, y);
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
        var ncell;
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
        var lv = [ncell.x, ncell.y];
        for (var t = 0; t < 10; t++) {
            var nv = [
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
            if (this.r.sb(this.f.randomizer.hd(0, 1, "com middleness"))) {
                lv[0] = Math.floor(this.hw);
            }
        }
        components[this.r.schoose(this.f.componentChances)](this, lv);
        this.totaldone++;
        return false;
    }
}

// CONCATENATED MODULE: ./src/index.js
//



function hashi(seed) {
  var t = 1206170165;

  for (var x = seed.length - 1; x >= 0; x--) {
    var c = seed.charCodeAt(x);
    t = (t << 5) + t ^ c ^ t << c % 13 + 1 ^ t >> c % 17 + 1;
  }

  return t >>> 0;
}

function hashd(seed) {
  return (hashi("." + seed) * 4294967296 + hashi(seed)) / 18446744073709551616;
}

function zi(min, max, seed) {
  if (seed == null) {
    return Math.floor(min + Math.random() * (1 + (max - min)));
  } else {
    return Math.floor(min + hashd(seed) * (1 + (max - min)));
  }
}

var characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomseed(n, seed) {
  var s = "";

  for (var x = 0; x < n; x++) {
    s = s + characters[zi(0, characters.length - 1, seed + "_" + x)];
  }

  return s;
}

var defaultseedlength = 16;
var currentship = null;

function renderShip() {
  if (currentship != null) {
    var done = false;

    do {
      done = currentship.addcomponent();
    } while (!done);

    currentship.cfx.clearRect(currentship.hw + currentship.w % 2, 0, currentship.w, currentship.h);
    currentship.cfx.scale(-1, 1);
    currentship.cfx.drawImage(currentship.cf, 0 - currentship.w, 0);
  }
}

function createShip(nfs, sseed) {
  currentship = new ship_Ship(new faction_Faction(nfs), sseed);
  renderShip(); // currentship.cf has the canvas with the image
  // currentship.width
  // currentship.height

  return currentship;
}

function newship(faction) {
  return createShip(faction, randomseed(defaultseedlength, "_" + Math.random()));
}
function newfaction() {
  return newship(randomseed(defaultseedlength, "_" + Math.random()));
}

/***/ })
/******/ ]);
});