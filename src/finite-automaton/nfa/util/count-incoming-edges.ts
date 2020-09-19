import {NfaDeclaration} from "../nfa-declaration";

export function countIncomingEdges (
    nfa : NfaDeclaration,
    state : string
) : number {
    let result : number = 0;

    for (const t of nfa.transitions) {
        for (const dstStateSet of t.dstStateSets) {
            for (const dstState of dstStateSet) {
                if (dstState == state) {
                    ++result;
                }
            }
        }
    }

    return result;
}
