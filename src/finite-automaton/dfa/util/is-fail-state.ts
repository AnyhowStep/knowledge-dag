import {DfaTransition} from "../dfa-declaration";

export function isFailState (acceptStates : readonly string[], t : DfaTransition) {
    return (
        !acceptStates.includes(t.srcState) &&
        t.dstStates.every(dstState => dstState == t.srcState)
    );
}
