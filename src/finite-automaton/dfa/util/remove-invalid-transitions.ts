import {DfaDeclaration} from "../dfa-declaration";
import {getValidTransitions} from "./get-valid-transitions";

export function removeInvalidTransitions (
    dfa : DfaDeclaration
) : DfaDeclaration {

    const transitions = getValidTransitions(dfa.startState, dfa.transitions);

    return {
        ...dfa,
        acceptStates : dfa.acceptStates
            .filter(
                acceptState => transitions.some(t => t.srcState == acceptState)
            ),
        transitions,
    };
}
