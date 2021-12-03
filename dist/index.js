/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 505:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Section {
    constructor(heading, headingType) {
        this._lines = [];
        this.heading = heading || "";
        this.headingType = headingType || 0 /* none */;
    }
    lines() {
        return this._lines.length - this.headingType;
    }
    addLine(line) {
        this._lines.push(line);
    }
    lastLine() {
        return this._lines.at(-1) || "";
    }
    popLastLine() {
        if (this.lines() > 0) {
            return this._lines.pop();
        }
        else {
            throw new RangeError("No last line to pop");
        }
    }
    toString() {
        return "stra";
    }
}
exports["default"] = Section;


/***/ }),

/***/ 144:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// import { getInput, setOutput } from "@actions/core";
const Section_1 = __importDefault(__nccwpck_require__(505));
const fs_1 = __nccwpck_require__(147);
// const section = getInput("section");
// const caseSensitiveInput = getInput("case-sensitive").toLowerCase();
// const caseSensitive = (caseSensitiveInput === "true" || caseSensitiveInput === "1");
const buffer = (0, fs_1.readFileSync)("../README.md");
const lines = buffer.toString().split("\n");
const sections = [];
let currentSection = new Section_1.default();
for (const line of lines) {
    // Detects 1 or more #s at the beginning of a line
    if (/^\s*#{1,6}\s+/m.test(line)) {
        // If Heading is on the first line
        if (currentSection.lines() === 0 && currentSection.headingType === 0 /* none */) {
            currentSection.heading = line;
            currentSection.headingType = 1 /* hash */;
        }
        else {
            sections.push(currentSection);
            currentSection = new Section_1.default(line, 1 /* hash */);
        }
        // Detects if the line is just 3 or more dashes or equals signs
    }
    else if (/^(-|=){3,}\s*$/m.test(line) && currentSection.lines() > 0) {
        // Check the line before, if not blank and not ---: heading
        if (currentSection.lastLine().length > 0 && !/^-{3,}\s*$/m.test(currentSection.lastLine())) {
            const heading = currentSection.popLastLine();
            sections.push(currentSection);
            currentSection = new Section_1.default(heading, 2 /* underline */);
            currentSection.addLine(heading);
        }
    }
    currentSection.addLine(line);
}
if (currentSection.lines() > 0 || currentSection.headingType !== 0 /* none */) {
    sections.push(currentSection);
}


/***/ }),

/***/ 147:
/***/ ((module) => {

module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(144);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;