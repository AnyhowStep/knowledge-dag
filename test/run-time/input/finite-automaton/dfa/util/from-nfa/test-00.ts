import * as tape from "tape";
import {language10Collection, isSubSet, findExtraValues} from "../../../nfa/nfa-collection";
import {DfaUtil} from "../../../../../../../dist/finite-automaton";

tape(__filename, (t) => {
    for (const { nfa, language10 : language10_nfa } of language10Collection) {
        const dfa = DfaUtil.fromNfa(nfa);
        const language10_dfa = DfaUtil.generateLanguage({
            dfa,
            maxLength : 10,
        });

        t.true(
            isSubSet(language10_dfa, language10_nfa),
            `fromNfa(${nfa.name}) has extra values ${findExtraValues(language10_dfa, language10_nfa).join(",")}`
        );
        t.true(
            isSubSet(language10_nfa, language10_dfa),
            `fromNfa(${nfa.name}) has missing values ${findExtraValues(language10_nfa, language10_dfa).join(",")}`
        );
    }

    t.end();
});
