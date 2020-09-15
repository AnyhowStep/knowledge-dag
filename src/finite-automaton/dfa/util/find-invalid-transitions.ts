import {getValidTransitions} from "./get-valid-transitions";
import {DfaTransition} from "../dfa-declaration";

export function getInvalidTransitions (startState : string, transitions : readonly DfaTransition[]) {
    const valid = getValidTransitions(startState, transitions);
    return transitions.filter(t => !valid.includes(t));
}
