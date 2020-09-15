import {DfaTransition} from "../dfa-declaration";

function getValidTransitionsImpl (
    cur : string,
    transitions : Map<string, DfaTransition>,
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

    for (const dstState of transition.dstStates) {
        getValidTransitionsImpl(
            dstState,
            transitions,
            validStates
        );
    }
}

export function getValidTransitions (
    startState : string,
    transitions : readonly DfaTransition[]
) : readonly DfaTransition[] {
    const validStates = new Set<string>();

    const map = new Map<string, DfaTransition>();
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
