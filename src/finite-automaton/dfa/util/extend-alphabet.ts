import {DfaDeclaration} from "../dfa-declaration";
import {findOrCreateFailState} from "./find-or-create-fail-state";

/**
 *
 * @param dfa
 * @param newAlphabet - Must be a superset of `dfa.alphabet`
 */
export function extendAlphabet (dfa : DfaDeclaration, newAlphabet : DfaDeclaration["alphabet"]) : DfaDeclaration {
    if (!dfa.alphabet.every(letter => newAlphabet.includes(letter))) {
        throw new Error(`newAlphabet must be a superset of dfa.alphabet`);
    }

    const missingAlphabet = newAlphabet.filter(newLetter => !dfa.alphabet.includes(newLetter));

    if (missingAlphabet.length == 0) {
        //No changes needed
        return dfa;
    }

    const findOrCreateFailStateResult = findOrCreateFailState(dfa);
    dfa = findOrCreateFailStateResult.dfa;
    const {failState} = findOrCreateFailStateResult;

    const name = dfa.name;
    const alphabet = [...dfa.alphabet, ...missingAlphabet];
    const startState = dfa.startState;
    const acceptStates = dfa.acceptStates;
    const transitions = dfa.transitions.map(transition => {
        return {
            srcState : transition.srcState,
            dstStates : [...transition.dstStates, ...missingAlphabet.map(() => failState)],
        };
    });

    return {
        name,
        alphabet,
        startState,
        acceptStates,
        transitions,
    };
}
