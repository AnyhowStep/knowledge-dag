import {DfaDeclaration} from "../dfa-declaration";
import {isFailState} from "./is-fail-state";

export function findFailStates (dfa : DfaDeclaration) {
    return dfa.transitions.filter(t => isFailState(dfa.acceptStates, t));
}
