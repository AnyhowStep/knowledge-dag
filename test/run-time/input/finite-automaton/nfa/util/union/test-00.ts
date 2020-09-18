import * as tape from "tape";
import {language10Collection, isSubSet, findExtraValues} from "../../nfa-collection";
import {NfaUtil} from "../../../../../../../dist/finite-automaton";

tape(__filename, (t) => {
    for (const { nfa : nfa1, language10 : language10_1 } of language10Collection) {
        for (const { nfa : nfa2, language10 : language10_2 } of language10Collection) {
            const nfa3 = NfaUtil.union(nfa1, nfa2);
            const language10_3 = NfaUtil.generateLanguage({
                nfa : nfa3,
                maxLength : 10,
            });

            const language10_1_2 = new Set<string>();
            for (const word of language10_1) {
                language10_1_2.add(word);
            }
            for (const word of language10_2) {
                language10_1_2.add(word);
            }

            t.true(
                isSubSet(language10_3, language10_1_2),
                `${nfa1.name} \\cup ${nfa2.name} has extra values ${findExtraValues(language10_3, language10_1_2).length}`
            );
            t.true(
                isSubSet(language10_1_2, language10_3),
                `${nfa1.name} \\cup ${nfa2.name} has missing values ${findExtraValues(language10_1_2, language10_3).length}`
            );
        }
    }

    t.end();
});
