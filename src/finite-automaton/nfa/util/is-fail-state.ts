import {NfaTransition} from "../nfa-declaration";

export function isFailState (acceptStates : readonly string[], t : NfaTransition) {
    return (
        !acceptStates.includes(t.srcState) &&
        t.dstStateSets.every(
            dstStateSet => dstStateSet.every(dstState => dstState == t.srcState)
        )
    );
}
