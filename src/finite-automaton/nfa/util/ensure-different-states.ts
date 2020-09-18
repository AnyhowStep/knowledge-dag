import {NfaDeclaration} from "../nfa-declaration";
import {renameState} from "./rename-state";
import {newStateName} from "./new-state-name";

export function ensureDifferentStates (
    nfa1 : NfaDeclaration,
    nfa2 : NfaDeclaration
) : {
    nfa1 : NfaDeclaration,
    nfa2 : NfaDeclaration
} {
    const transitions2 = nfa2.transitions;

    for (const t of transitions2) {
        if (nfa1.transitions.some(other => other.srcState == t.srcState)) {
            nfa2 = renameState(
                nfa2,
                t.srcState,
                newStateName(
                    [...nfa1.transitions, ...nfa2.transitions],
                    [t.srcState]
                )
            );
        }
    }

    return {
        nfa1,
        nfa2,
    };
}
