import {NfaDeclaration, NfaTransition} from "../nfa-declaration";
import {ensureDifferentStates} from "./ensure-different-states";
import {AlphabetUtil} from "../../alphabet";
import {extendAlphabet} from "./extend-alphabet";
import {findFailStates} from "./find-fail-states";

function intersectDst (
    {
        fail1,
        fail2,
        dst1,
        dst2,
    } :
    {
        fail1 : readonly NfaTransition[],
        fail2 : readonly NfaTransition[],
        dst1 : string,
        dst2 : string
    }
) {
    if (
        fail1.length > 0 &&
        fail2.length > 0 &&
        (
            fail1.some(t => t.srcState == dst1) ||
            fail2.some(t => t.srcState == dst2)
        )
    ) {
        return `\\ordered{${fail1[0].srcState}, ${fail2[0].srcState}}`;
    } else {
        return `\\ordered{${dst1}, ${dst2}}`;
    }
}

export function intersection (nfa1 : NfaDeclaration, nfa2 : NfaDeclaration) : NfaDeclaration {
    const ensureDifferentStatesResult = ensureDifferentStates(nfa1, nfa2);
    nfa1 = ensureDifferentStatesResult.nfa1;
    nfa2 = ensureDifferentStatesResult.nfa2;

    const alphabet = AlphabetUtil.mergeAlphabet(nfa1.alphabet, nfa2.alphabet);

    nfa1 = extendAlphabet(nfa1, alphabet);
    nfa2 = extendAlphabet(nfa2, alphabet);

    const fail1 = findFailStates(nfa1);
    const fail2 = findFailStates(nfa2);

    const startState = `\\ordered{${nfa1.startState}, ${nfa2.startState}}`;

    //Intersect the accept states
    const acceptStates : string[] = [];
    for (const a1 of nfa1.acceptStates) {
        for (const a2 of nfa2.acceptStates) {
            acceptStates.push(`\\ordered{${a1}, ${a2}}`);
        }
    }

    //Intersect the transitions
    const transitions : {
        readonly srcState : string,
        readonly dstStateSets : readonly (readonly string[])[]
    }[] = [];
    for (const t1 of nfa1.transitions) {
        for (const t2 of nfa2.transitions) {
            const srcState = `\\ordered{${t1.srcState}, ${t2.srcState}}`;
            const dstStateSets : (readonly string[])[] = [];

            for (const letter of alphabet) {
                const index1 = nfa1.alphabet.indexOf(letter);
                const index2 = nfa2.alphabet.indexOf(letter);

                if (index1 < 0 || index2 < 0) {
                    throw new Error(`Letter '${letter}' not found`);
                }

                const dstStateSet : string[] = [];

                const dstSet1 = t1.dstStateSets[index1];
                const dstSet2 = t2.dstStateSets[index2];

                for (const dst1 of dstSet1) {
                    for (const dst2 of dstSet2) {
                        dstStateSet.push(intersectDst({
                            fail1,
                            fail2,
                            dst1,
                            dst2,
                        }));
                    }
                }

                dstStateSets.push(dstStateSet);
            }

            //Handle epsilon transitions
            const epsilonStateSet : string[] = [];
            const epsilonSet1 = t1.dstStateSets[nfa1.alphabet.length];
            const epsilonSet2 = t2.dstStateSets[nfa2.alphabet.length];

            if (epsilonSet1.length > 0) {
                if (epsilonSet2.length > 0) {
                    //Transition both
                    for (const dst1 of epsilonSet1) {
                        for (const dst2 of epsilonSet2) {
                            epsilonStateSet.push(intersectDst({
                                fail1,
                                fail2,
                                dst1,
                                dst2,
                            }));
                        }
                    }
                } else {
                    //Only transition 1
                    const dst2 = t2.srcState;
                    for (const dst1 of epsilonSet1) {
                        epsilonStateSet.push(intersectDst({
                            fail1,
                            fail2,
                            dst1,
                            dst2,
                        }));
                    }
                }
            } else {
                if (epsilonSet2.length > 0) {
                    //Only transition 2
                    const dst1 = t1.srcState;
                    for (const dst2 of epsilonSet2) {
                        epsilonStateSet.push(intersectDst({
                            fail1,
                            fail2,
                            dst1,
                            dst2,
                        }));
                    }
                } else {
                    //Do nothing
                }
            }
            dstStateSets.push(epsilonStateSet);

            transitions.push({
                srcState,
                dstStateSets,
            });
        }
    }

    return {
        name : `${nfa1.name} \\cap ${nfa2.name}`,
        alphabet,
        startState,
        acceptStates,
        transitions,
    };
}
