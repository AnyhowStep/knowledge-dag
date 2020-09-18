import {NfaTransition} from "../nfa-declaration";

function getEpsilonTransitionsImpl (
    cur : string,
    transitions : Map<string, NfaTransition>,
    epsilonStates : Set<string>
) {
    if (epsilonStates.has(cur)) {
        return;
    }
    epsilonStates.add(cur);

    const transition = transitions.get(cur);
    if (transition == undefined) {
        return;
    }

    const epsilonDstStateSet = transition.dstStateSets[transition.dstStateSets.length-1];
    for (const dstState of epsilonDstStateSet) {
        getEpsilonTransitionsImpl(
            dstState,
            transitions,
            epsilonStates
        );
    }
}

export function getEpsilonTransitions (
    startState : string,
    transitions : readonly NfaTransition[]
) : readonly NfaTransition[] {
    const epsilonStates = new Set<string>();

    const map = new Map<string, NfaTransition>();
    for (const t of transitions) {
        map.set(t.srcState, t);
    }

    getEpsilonTransitionsImpl(
        startState,
        map,
        epsilonStates
    );

    return transitions.filter(t => epsilonStates.has(t.srcState));
}
