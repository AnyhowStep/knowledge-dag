"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tape = require("tape");
const dfa_collection_1 = require("../../dfa-collection");
const finite_automaton_1 = require("../../../../../../../dist/finite-automaton");
tape(__filename, (t) => {
    for (const { dfa: dfa1, language10: language10_1 } of dfa_collection_1.language10Collection) {
        for (const { dfa: dfa2, language10: language10_2 } of dfa_collection_1.language10Collection) {
            const dfa3 = finite_automaton_1.DfaUtil.intersection(dfa1, dfa2);
            const language10_3 = finite_automaton_1.DfaUtil.generateLanguage({
                dfa: dfa3,
                maxLength: 10,
            });
            const language10_1_2 = new Set();
            for (const word of language10_1) {
                if (language10_2.has(word)) {
                    language10_1_2.add(word);
                }
            }
            t.true(dfa_collection_1.isSubSet(language10_3, language10_1_2), `${dfa1.name} \\cap ${dfa2.name} has extra values ${dfa_collection_1.findExtraValues(language10_3, language10_1_2).join(",")}`);
            t.true(dfa_collection_1.isSubSet(language10_1_2, language10_3), `${dfa1.name} \\cap ${dfa2.name} has missing values ${dfa_collection_1.findExtraValues(language10_1_2, language10_3).join(",")}`);
        }
    }
    t.end();
});
//# sourceMappingURL=test-00.js.map