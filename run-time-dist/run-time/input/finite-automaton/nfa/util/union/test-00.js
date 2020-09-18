"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tape = require("tape");
const nfa_collection_1 = require("../../nfa-collection");
const finite_automaton_1 = require("../../../../../../../dist/finite-automaton");
tape(__filename, (t) => {
    for (const { nfa: nfa1, language10: language10_1 } of nfa_collection_1.language10Collection) {
        for (const { nfa: nfa2, language10: language10_2 } of nfa_collection_1.language10Collection) {
            const nfa3 = finite_automaton_1.NfaUtil.union(nfa1, nfa2);
            const language10_3 = finite_automaton_1.NfaUtil.generateLanguage({
                nfa: nfa3,
                maxLength: 10,
            });
            const language10_1_2 = new Set();
            for (const word of language10_1) {
                language10_1_2.add(word);
            }
            for (const word of language10_2) {
                language10_1_2.add(word);
            }
            t.true(nfa_collection_1.isSubSet(language10_3, language10_1_2), `${nfa1.name} \\cup ${nfa2.name} has extra values ${nfa_collection_1.findExtraValues(language10_3, language10_1_2).join(",")}`);
            t.true(nfa_collection_1.isSubSet(language10_1_2, language10_3), `${nfa1.name} \\cup ${nfa2.name} has missing values ${nfa_collection_1.findExtraValues(language10_1_2, language10_3).join(",")}`);
        }
    }
    t.end();
});
//# sourceMappingURL=test-00.js.map