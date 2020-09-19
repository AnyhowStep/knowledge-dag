import * as tape from "tape";
import {isSubSet, findExtraValues} from "../../../nfa/nfa-collection";
import {NfaUtil} from "../../../../../../../dist/finite-automaton";
import {RegularExpressionUtil} from "../../../../../../../dist/finite-automaton/regular-expression";

tape(__filename, (t) => {
    const arr = [
        "\\varnothing",
        "(\\varnothing)",
        "\\varnothing\\varnothing",
        "\\varnothing \\circ \\varnothing",
        "\\varnothing \\cup \\varnothing",
        "a \\circ \\varnothing",
        "a\\varnothing",
        "\\varnothing \\circ a",
        "\\varnothinga",
    ];
    for (const str of arr) {
        let i = 0;
        const re = RegularExpressionUtil.fromString(str);
        const nfa = NfaUtil.fromRegularExpression(re, () => `q${++i}`);

        const language10 = NfaUtil.generateLanguage({
            nfa,
            maxLength : 10,
        });

        const expected = new Set<string>();

        t.true(
            isSubSet(language10, expected),
            `re(${nfa.name}) has extra values ${findExtraValues(language10, expected).join(",")}`
        );
        t.true(
            isSubSet(expected, language10),
            `re(${nfa.name}) has missing values ${findExtraValues(expected, language10).join(",")}`
        );
    }

    t.end();
});
