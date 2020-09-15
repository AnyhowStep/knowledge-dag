import {DfaDeclaration, DfaTransition} from "../dfa-declaration";
import {getValidTransitions} from "./get-valid-transitions";

function tryGetAcceptCycle (
    state : string,
    acceptStates : readonly string[],
    transitions : readonly DfaTransition[]
) {
    const validTransitions = getValidTransitions(
        state,
        transitions
    );
    if (
        validTransitions.length > 1 &&
        validTransitions.every(t => acceptStates.includes(t.srcState))
    ) {
        return validTransitions;
    } else {
        return undefined;
    }
}

/**
 * An "accept cycle" is when an accept state can only
 * ever travel to another accept state.
 *
 * In this case, we can combine multiple accept states into one accept state.
 */
export function removeAcceptCycles (
    dfa : DfaDeclaration
) : DfaDeclaration {
    let openAcceptStates = [...dfa.acceptStates];
    let transitions = dfa.transitions;

    const acceptStates : string[] = [];
    while (openAcceptStates.length > 0) {
        const curAcceptState = openAcceptStates[0];
        //Will be length 2 or more
        const acceptCycle = tryGetAcceptCycle(curAcceptState, dfa.acceptStates, transitions);
        if (acceptCycle == undefined) {
            acceptStates.push(curAcceptState);
            openAcceptStates.shift();
            continue;
        }

        //Keep only one state in the cycle.
        //Everything else is removed.
        //We want to keep the start state always.
        const keep = (
            acceptCycle.some(t => t.srcState == dfa.startState) ?
            dfa.startState :
            acceptCycle[0].srcState
        );

        acceptStates.push(keep);
        openAcceptStates = openAcceptStates.filter(
            open => !acceptCycle.some(t => t.srcState == open)
        );

        for (const accept of acceptCycle) {
            if (accept.srcState == keep) {
                //Do not remove this state
                continue;
            }
            /**
             * Remove `accept`,
             * anything pointing to `accept` should point to `keep`
             */
            transitions = transitions
                .filter(t => t.srcState != accept.srcState)
                .map(t => {
                    return {
                        srcState : t.srcState,
                        dstStates : t.dstStates.map(dstState => {
                            return (
                                dstState == accept.srcState ?
                                keep :
                                dstState
                            );
                        }),
                    };
                });
        }
    }

    return {
        ...dfa,
        acceptStates,
        transitions,
    };
}
