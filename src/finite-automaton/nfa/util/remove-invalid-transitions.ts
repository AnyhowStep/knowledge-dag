import {NfaDeclaration} from "../nfa-declaration";
import {getValidTransitions} from "./get-valid-transitions";

export function removeInvalidTransitions (
    nfa : NfaDeclaration
) : NfaDeclaration {

    const transitions = getValidTransitions(nfa.startState, nfa.transitions);

    return {
        ...nfa,
        acceptStates : nfa.acceptStates
            .filter(
                acceptState => transitions.some(t => t.srcState == acceptState)
            ),
        transitions,
    };
}
