"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nfa1 = require("./nfa1.json");
const nfa2 = require("./nfa2.json");
const nfa3 = require("./nfa3.json");
const nfa4 = require("./nfa4.json");
const nfa5 = require("./nfa5.json");
const finite_automaton_1 = require("../../../../../dist/finite-automaton");
exports.nfaCollection = [
    nfa1,
    nfa2,
    nfa3,
    nfa4,
    nfa5,
];
exports.language10Collection = exports.nfaCollection.map(nfa => {
    return {
        nfa,
        language10: finite_automaton_1.NfaUtil.generateLanguage({
            nfa,
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
//# sourceMappingURL=nfa-collection.js.map