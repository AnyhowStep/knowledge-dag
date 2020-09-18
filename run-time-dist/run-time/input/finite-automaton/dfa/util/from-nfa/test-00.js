"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tape = require("tape");
const nfa_collection_1 = require("../../../nfa/nfa-collection");
const finite_automaton_1 = require("../../../../../../../dist/finite-automaton");
tape(__filename, (t) => {
    for (const { nfa, language10: language10_nfa } of nfa_collection_1.language10Collection) {
        const dfa = finite_automaton_1.DfaUtil.fromNfa(nfa);
        const language10_dfa = finite_automaton_1.DfaUtil.generateLanguage({
            dfa,
            maxLength: 10,
        });
        t.true(nfa_collection_1.isSubSet(language10_dfa, language10_nfa), `fromNfa(${nfa.name}) has extra values ${nfa_collection_1.findExtraValues(language10_dfa, language10_nfa).join(",")}`);
        t.true(nfa_collection_1.isSubSet(language10_nfa, language10_dfa), `fromNfa(${nfa.name}) has missing values ${nfa_collection_1.findExtraValues(language10_nfa, language10_dfa).join(",")}`);
    }
    t.end();
});
//# sourceMappingURL=test-00.js.map