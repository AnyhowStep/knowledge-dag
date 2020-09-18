import {NfaTransition} from "../nfa-declaration";

function getValidTransitionsImpl (
    cur : string,
    transitions : Map<string, NfaTransition>,
    validStates : Set<string>
) {
    if (validStates.has(cur)) {
        return;
    }
    validStates.add(cur);

    const transition = transitions.get(cur);
    if (transition == undefined) {
        return;
    }

    for (const dstStateSet of transition.dstStateSets) {
        for (const dstState of dstStateSet) {
            getValidTransitionsImpl(
                dstState,
                transitions,
                validStates
            );
        }
    }
}

export function getValidTransitions (
    startState : string,
    transitions : readonly NfaTransition[]
) : readonly NfaTransition[] {
    const validStates = new Set<string>();

    const map = new Map<string, NfaTransition>();
    for (const t of transitions) {
        map.set(t.srcState, t);
    }

    getValidTransitionsImpl(
        startState,
        map,
        validStates
    );

    return transitions.filter(t => validStates.has(t.srcState));
}
