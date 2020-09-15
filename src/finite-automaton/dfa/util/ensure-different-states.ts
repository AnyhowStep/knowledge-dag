import {DfaDeclaration} from "../dfa-declaration";
import {renameState} from "./rename-state";
import {newStateName} from "./new-state-name";

export function ensureDifferentStates (
    dfa1 : DfaDeclaration,
    dfa2 : DfaDeclaration
) : {
    dfa1 : DfaDeclaration,
    dfa2 : DfaDeclaration
} {
    const transitions2 = dfa2.transitions;

    for (const t of transitions2) {
        if (dfa1.transitions.some(other => other.srcState == t.srcState)) {
            dfa2 = renameState(
                dfa2,
                t.srcState,
                newStateName(
                    [...dfa1.transitions, ...dfa2.transitions],
                    [t.srcState]
                )
            );
        }
    }

    return {
        dfa1,
        dfa2,
    };
}
