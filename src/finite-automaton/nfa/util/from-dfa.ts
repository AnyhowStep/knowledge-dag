import {DfaDeclaration} from "../../dfa";
import {NfaDeclaration, NfaTransition} from "../nfa-declaration";

export function fromDfa (dfa : DfaDeclaration) : NfaDeclaration {
    return {
        name : dfa.name,
        alphabet : dfa.alphabet,
        startState : dfa.startState,
        acceptStates : dfa.acceptStates,
        transitions : dfa.transitions.map((t) : NfaTransition => {
            return {
                srcState : t.srcState,
                dstStateSets : [
                    ...t.dstStates.map(dstState => [dstState]),
                    []
                ],
            };
        }),
    };
}
