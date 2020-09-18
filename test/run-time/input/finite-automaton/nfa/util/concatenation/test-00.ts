import * as tape from "tape";
import {language10Collection, isSubSet, findExtraValues} from "../../nfa-collection";
import {NfaUtil} from "../../../../../../../dist/finite-automaton";

tape(__filename, (t) => {
    for (const { nfa : nfa1, language10 : language10_1 } of language10Collection) {
        for (const { nfa : nfa2, language10 : language10_2 } of language10Collection) {
            if (
                nfa1.name == "N3" &&
                nfa2.name == "N3"
            ) {
                //This test would take too long to compute
                continue;
            }
            console.log(`${nfa1.name} \\circ ${nfa2.name} test`);

            const nfa3 = NfaUtil.concatenation(nfa1, nfa2);
            const language10_3 = NfaUtil.generateLanguage({
                nfa : nfa3,
                maxLength : 10,
            });

            const language10_1_2 = new Set<string>();
            for (const word1 of language10_1) {
                for (const word2 of language10_2) {
                    const concatenated = word1 + word2;
                    if (concatenated.length <= 10) {
                        language10_1_2.add(concatenated);
                    }
                }
            }

            t.true(
                isSubSet(language10_3, language10_1_2),
                `${nfa1.name} \\circ ${nfa2.name} has extra values ${findExtraValues(language10_3, language10_1_2).length}`
            );
            t.true(
                isSubSet(language10_1_2, language10_3),
                `${nfa1.name} \\circ ${nfa2.name} has missing values ${findExtraValues(language10_1_2, language10_3).join(", ")}`
            );

            if (
                !isSubSet(language10_3, language10_1_2) ||
                !isSubSet(language10_1_2, language10_3)
            ) {
                console.log("language10_1_2", language10_1_2.size, [...language10_1_2].join(", "));
                console.log("language10_3", language10_3.size, [...language10_3].join(", "));

                process.exit(1);
            }
        }
    }

    t.end();
});
