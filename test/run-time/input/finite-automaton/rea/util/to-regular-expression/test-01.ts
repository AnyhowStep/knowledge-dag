import * as tape from "tape";
import {language10Collection, isSubSet, findExtraValues} from "../../../dfa/dfa-collection";
import {NfaUtil, ReaUtil} from "../../../../../../../dist/finite-automaton";

tape(__filename, (t) => {
    for (const { dfa, language10 } of language10Collection) {
        const nfa = NfaUtil.fromDfa(dfa);
        const rea = ReaUtil.fromNfa(nfa);
        const re = ReaUtil.toRegularExpression(rea);

        let i = 0;
        const nfa_re = NfaUtil.fromRegularExpression(
            re,
            () => `q${++i}`
        );

        const language10_re = NfaUtil.generateLanguage({
            nfa : nfa_re,
            maxLength : 10,
        });

        t.true(
            isSubSet(language10_re, language10),
            `re(${nfa.name}) has extra values ${findExtraValues(language10_re, language10).length}`
        );
        t.true(
            isSubSet(language10, language10_re),
            `re(${nfa.name}) has missing values ${findExtraValues(language10, language10_re).length}`
        );
    }

    t.end();
});
