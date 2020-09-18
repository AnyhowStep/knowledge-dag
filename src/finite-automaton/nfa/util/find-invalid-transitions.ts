import {getValidTransitions} from "./get-valid-transitions";
import {NfaTransition} from "../nfa-declaration";

export function getInvalidTransitions (startState : string, transitions : readonly NfaTransition[]) {
    const valid = getValidTransitions(startState, transitions);
    return transitions.filter(t => !valid.includes(t));
}
