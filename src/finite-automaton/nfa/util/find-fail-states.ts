import {NfaDeclaration} from "../nfa-declaration";
import {isFailState} from "./is-fail-state";

export function findFailStates (nfa : NfaDeclaration) {
    return nfa.transitions.filter(t => isFailState(nfa.acceptStates, t));
}
