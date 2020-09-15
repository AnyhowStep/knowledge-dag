import {DfaDeclaration} from "../dfa-declaration";
import {mergeAlphabet} from "./merge-alphabet";
import {extendAlphabet} from "./extend-alphabet";
import {findFailStates} from "./find-fail-states";
import {ensureDifferentStates} from "./ensure-different-states";

export function intersection (dfa1 : DfaDeclaration, dfa2 : DfaDeclaration) : DfaDeclaration {
    const ensureDifferentStatesResult = ensureDifferentStates(dfa1, dfa2);
    dfa1 = ensureDifferentStatesResult.dfa1;
    dfa2 = ensureDifferentStatesResult.dfa2;

    const alphabet = mergeAlphabet(dfa1.alphabet, dfa2.alphabet);

    dfa1 = extendAlphabet(dfa1, alphabet);
    dfa2 = extendAlphabet(dfa2, alphabet);

    const fail1 = findFailStates(dfa1);
    const fail2 = findFailStates(dfa2);

    const startState = `\\ordered{${dfa1.startState}, ${dfa2.startState}}`;

    //Intersect the accept states
    const acceptStates : string[] = [];
    for (const a1 of dfa1.acceptStates) {
        for (const a2 of dfa2.acceptStates) {
            acceptStates.push(`\\ordered{${a1}, ${a2}}`);
        }
    }

    //Intersect the transitions
    const transitions : {
        readonly srcState : string,
        readonly dstStates : readonly string[]
    }[] = [];
    for (const t1 of dfa1.transitions) {
        for (const t2 of dfa2.transitions) {
            const srcState = `\\ordered{${t1.srcState}, ${t2.srcState}}`;
            const dstStates : string[] = [];

            for (const letter of alphabet) {
                const index1 = dfa1.alphabet.indexOf(letter);
                const index2 = dfa2.alphabet.indexOf(letter);

                if (index1 < 0 || index2 < 0) {
                    throw new Error(`Letter '${letter}' not found`);
                }

                const dst1 = t1.dstStates[index1];
                const dst2 = t2.dstStates[index2];

                if (
                    fail1.length > 0 &&
                    fail2.length > 0 &&
                    (
                        fail1.some(t => t.srcState == dst1) ||
                        fail2.some(t => t.srcState == dst2)
                    )
                ) {
                    dstStates.push(`\\ordered{${fail1[0].srcState}, ${fail2[0].srcState}}`);
                } else {
                    dstStates.push(`\\ordered{${dst1}, ${dst2}}`);
                }
            }

            transitions.push({
                srcState,
                dstStates,
            });
        }
    }

    return {
        name : `${dfa1.name} \\cap ${dfa2.name}`,
        alphabet,
        startState,
        acceptStates,
        transitions,
    };
}
