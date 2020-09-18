"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dfa1 = require("./dfa1.json");
const dfa2 = require("./dfa2.json");
const dfa3 = require("./dfa3.json");
const dfa4 = require("./dfa4.json");
const dfa5 = require("./dfa5.json");
const dfa6 = require("./dfa6.json");
const dfa7 = require("./dfa7.json");
const dfa8 = require("./dfa8.json");
const dfa9 = require("./dfa9.json");
const dfa10 = require("./dfa10.json");
const dfa11 = require("./dfa11.json");
const dfa12 = require("./dfa12.json");
const dfa13 = require("./dfa13.json");
const finite_automaton_1 = require("../../../../../dist/finite-automaton");
exports.dfaCollection = [
    dfa1,
    dfa2,
    dfa3,
    dfa4,
    dfa5,
    dfa6,
    dfa7,
    dfa8,
    dfa9,
    dfa10,
    dfa11,
    dfa12,
    dfa13,
];
exports.language10Collection = exports.dfaCollection.map(dfa => {
    return {
        dfa,
        language10: finite_automaton_1.DfaUtil.generateLanguage({
            dfa,
            maxLength: 10,
        }),
    };
});
function isSubSet(a, b) {
    for (const wordA of a.values()) {
        if (!b.has(wordA)) {
            return false;
        }
    }
    return true;
}
exports.isSubSet = isSubSet;
function findExtraValues(a, b) {
    const result = [];
    for (const wordA of a.values()) {
        if (!b.has(wordA)) {
            result.push(wordA);
        }
    }
    return result;
}
exports.findExtraValues = findExtraValues;
//# sourceMappingURL=dfa-collection.js.map