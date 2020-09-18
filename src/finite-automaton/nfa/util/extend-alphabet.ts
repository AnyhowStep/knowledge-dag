import {NfaDeclaration} from "../nfa-declaration";

/**
 *
 * @param nfa
 * @param newAlphabet - Must be a superset of `nfa.alphabet`
 */
export function extendAlphabet (nfa : NfaDeclaration, newAlphabet : NfaDeclaration["alphabet"]) : NfaDeclaration {
    if (!nfa.alphabet.every(letter => newAlphabet.includes(letter))) {
        throw new Error(`newAlphabet must be a superset of nfa.alphabet`);
    }

    const missingAlphabet = newAlphabet.filter(newLetter => !nfa.alphabet.includes(newLetter));

    if (missingAlphabet.length == 0) {
        //No changes needed
        return nfa;
    }

    const name = nfa.name;
    const alphabet = [...nfa.alphabet, ...missingAlphabet];
    const startState = nfa.startState;
    const acceptStates = nfa.acceptStates;
    const transitions = nfa.transitions.map(transition => {
        const alphabetDstStateSets = [...transition.dstStateSets];
        const epsilonDstStateSet = alphabetDstStateSets.pop();

        if (epsilonDstStateSet == undefined) {
            throw new Error(`nfa must have dstStateSets`);
        }

        return {
            srcState : transition.srcState,
            dstStateSets : [
                ...alphabetDstStateSets,
                /**
                 * NFAs are allowed to have empty set transitions
                 */
                ...missingAlphabet.map(() => []),
                /**
                 * Epsilon transition is always last
                 */
                epsilonDstStateSet,
            ],
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
