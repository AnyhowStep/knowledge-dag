import {NfaDeclaration} from "../nfa-declaration";
import {ensureDifferentStates} from "./ensure-different-states";
import {AlphabetUtil} from "../../alphabet";
import {extendAlphabet} from "./extend-alphabet";

export function concatenation (nfa1 : NfaDeclaration, nfa2 : NfaDeclaration) : NfaDeclaration {
    const ensureDifferentStatesResult = ensureDifferentStates(nfa1, nfa2);
    nfa1 = ensureDifferentStatesResult.nfa1;
    nfa2 = ensureDifferentStatesResult.nfa2;

    const alphabet = AlphabetUtil.mergeAlphabet(nfa1.alphabet, nfa2.alphabet);

    nfa1 = extendAlphabet(nfa1, alphabet);
    nfa2 = extendAlphabet(nfa2, alphabet);

    return {
        name : `${nfa1.name} \\circ ${nfa2.name}`,
        alphabet,
        startState : nfa1.startState,
        acceptStates : nfa2.acceptStates,
        transitions : [
            ...nfa1.transitions.map(t => {
                const newDstStateSets : (readonly string[])[] = [];
                for (const letter of alphabet) {
                    const index = nfa1.alphabet.indexOf(letter);
                    const newDstStateSet = t.dstStateSets[index];
                    newDstStateSets.push(newDstStateSet);
                }
                if (nfa1.acceptStates.includes(t.srcState)) {
                    newDstStateSets.push([
                        ...t.dstStateSets[alphabet.length],
                        nfa2.startState,
                    ]);
                } else {
                    newDstStateSets.push(t.dstStateSets[alphabet.length]);
                }
                return {
                    srcState : t.srcState,
                    dstStateSets : newDstStateSets,
                };
            }),
            ...nfa2.transitions.map(t => {
                const newDstStateSets : (readonly string[])[] = [];
                for (const letter of alphabet) {
                    const index = nfa2.alphabet.indexOf(letter);
                    const newDstStateSet = t.dstStateSets[index];
                    newDstStateSets.push(newDstStateSet);
                }
                newDstStateSets.push(t.dstStateSets[alphabet.length]);
                return {
                    srcState : t.srcState,
                    dstStateSets : newDstStateSets,
                };
            }),
        ],
    };
}
