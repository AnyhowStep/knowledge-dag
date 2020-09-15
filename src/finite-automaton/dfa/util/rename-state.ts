import {DfaDeclaration} from "../dfa-declaration";

export function renameState (
    dfa : DfaDeclaration,
    oldState : string,
    newState : string
) : DfaDeclaration {
    const startState = (
        dfa.startState == oldState ?
        newState :
        dfa.startState
    );
    const acceptStates = dfa.acceptStates.map(acceptState => (
        acceptState == oldState ?
        newState :
        acceptState
    ));
    const transitions = dfa.transitions.map(t => {
        const srcState = (
            t.srcState == oldState ?
            newState :
            t.srcState
        );
        const dstStates = t.dstStates.map(dstState => (
            dstState == oldState ?
            newState :
            dstState
        ));
        return {
            srcState,
            dstStates,
        };
    });
    return {
        ...dfa,
        startState,
        acceptStates,
        transitions,
    };
}
