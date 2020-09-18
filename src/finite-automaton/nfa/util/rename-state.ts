import {NfaDeclaration} from "../nfa-declaration";

export function renameState (
    nfa : NfaDeclaration,
    oldState : string,
    newState : string
) : NfaDeclaration {
    const startState = (
        nfa.startState == oldState ?
        newState :
        nfa.startState
    );
    const acceptStates = nfa.acceptStates.map(acceptState => (
        acceptState == oldState ?
        newState :
        acceptState
    ));
    const transitions = nfa.transitions.map(t => {
        const srcState = (
            t.srcState == oldState ?
            newState :
            t.srcState
        );
        const dstStateSets = t.dstStateSets.map(dstStateSet => {
            return dstStateSet.map(dstState => (
                dstState == oldState ?
                newState :
                dstState
            ));
        });
        return {
            srcState,
            dstStateSets,
        };
    });
    return {
        ...nfa,
        startState,
        acceptStates,
        transitions,
    };
}
