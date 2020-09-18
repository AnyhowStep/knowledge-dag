import {NfaDeclaration} from "../nfa-declaration";
import {ensureDifferentStates} from "./ensure-different-states";
import {AlphabetUtil} from "../../alphabet";
import {extendAlphabet} from "./extend-alphabet";

export function union (nfa1 : NfaDeclaration, nfa2 : NfaDeclaration) : NfaDeclaration {
    const ensureDifferentStatesResult = ensureDifferentStates(nfa1, nfa2);
    nfa1 = ensureDifferentStatesResult.nfa1;
    nfa2 = ensureDifferentStatesResult.nfa2;

    const alphabet = AlphabetUtil.mergeAlphabet(nfa1.alphabet, nfa2.alphabet);

    nfa1 = extendAlphabet(nfa1, alphabet);
    nfa2 = extendAlphabet(nfa2, alphabet);

    const startState = `(${nfa1.name} \\cup ${nfa2.name})_{start}`;

    const dstStateSets : string[][] = nfa1.alphabet.map(() => []);
    dstStateSets.push([nfa1.startState, nfa2.startState]);

    return {
        name : `${nfa1.name} \\cup ${nfa2.name}`,
        alphabet,
        startState,
        acceptStates : [...nfa1.acceptStates, ...nfa2.acceptStates],
        transitions : [
            {
                srcState : startState,
                dstStateSets,
            },
            ...nfa1.transitions.map(t => {
                const newDstStateSets : (readonly string[])[] = [];
                for (const letter of alphabet) {
                    const index = nfa1.alphabet.indexOf(letter);
                    newDstStateSets.push(t.dstStateSets[index]);
                }
                newDstStateSets.push(t.dstStateSets[alphabet.length]);
                return {
                    srcState : t.srcState,
                    dstStateSets : newDstStateSets,
                };
            }),
            ...nfa2.transitions.map(t => {
                const newDstStateSets : (readonly string[])[] = [];
                for (const letter of alphabet) {
                    const index = nfa2.alphabet.indexOf(letter);
                    newDstStateSets.push(t.dstStateSets[index]);
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
