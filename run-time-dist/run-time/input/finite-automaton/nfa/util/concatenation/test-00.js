"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tape = require("tape");
const nfa_collection_1 = require("../../nfa-collection");
const finite_automaton_1 = require("../../../../../../../dist/finite-automaton");
tape(__filename, (t) => {
    for (const { nfa: nfa1, language10: language10_1 } of nfa_collection_1.language10Collection) {
        for (const { nfa: nfa2, language10: language10_2 } of nfa_collection_1.language10Collection) {
            if (nfa1.name == "N3" &&
                nfa2.name == "N3") {
                //This test would take too long to compute
                continue;
            }
            console.log(`${nfa1.name} \\circ ${nfa2.name} test`);
            const nfa3 = finite_automaton_1.NfaUtil.concatenation(nfa1, nfa2);
            const language10_3 = finite_automaton_1.NfaUtil.generateLanguage({
                nfa: nfa3,
                maxLength: 10,
            });
            const language10_1_2 = new Set();
            for (const word1 of language10_1) {
                for (const word2 of language10_2) {
                    const concatenated = word1 + word2;
                    if (concatenated.length <= 10) {
                        language10_1_2.add(concatenated);
                    }
                }
            }
            t.true(nfa_collection_1.isSubSet(language10_3, language10_1_2), `${nfa1.name} \\circ ${nfa2.name} has extra values ${nfa_collection_1.findExtraValues(language10_3, language10_1_2).length}`);
            t.true(nfa_collection_1.isSubSet(language10_1_2, language10_3), `${nfa1.name} \\circ ${nfa2.name} has missing values ${nfa_collection_1.findExtraValues(language10_1_2, language10_3).join(", ")}`);
            if (!nfa_collection_1.isSubSet(language10_3, language10_1_2) ||
                !nfa_collection_1.isSubSet(language10_1_2, language10_3)) {
                console.log("language10_1_2", language10_1_2.size, [...language10_1_2].join(", "));
                console.log("language10_3", language10_3.size, [...language10_3].join(", "));
                process.exit(1);
            }
        }
    }
    t.end();
});
//# sourceMappingURL=test-00.js.map