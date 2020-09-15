import * as tape from "tape";
import {language10Collection, isSubSet, findExtraValues} from "../../dfa-collection";
import {DfaUtil} from "../../../../../../../dist/finite-automaton";

tape(__filename, (t) => {
    for (const { dfa : dfa1, language10 : language10_1 } of language10Collection) {
        for (const { dfa : dfa2, language10 : language10_2 } of language10Collection) {
            const dfa3 = DfaUtil.intersection(dfa1, dfa2);
            const language10_3 = DfaUtil.generateLanguage({
                dfa : dfa3,
                maxLength : 10,
            });

            const language10_1_2 = new Set<string>();
            for (const word of language10_1) {
                if (language10_2.has(word)) {
                    language10_1_2.add(word);
                }
            }

            t.true(
                isSubSet(language10_3, language10_1_2),
                `${dfa1.name} \\cap ${dfa2.name} has extra values ${findExtraValues(language10_3, language10_1_2).join(",")}`
            );
            t.true(
                isSubSet(language10_1_2, language10_3),
                `${dfa1.name} \\cap ${dfa2.name} has missing values ${findExtraValues(language10_1_2, language10_3).join(",")}`
            );
        }
    }

    t.end();
});
