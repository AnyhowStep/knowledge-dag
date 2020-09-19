import {NfaDeclaration} from "../nfa-declaration";
import {countIncomingEdges} from "./count-incoming-edges";

function tryRemoveOneTrivialEpsilonTransition (
    nfa : NfaDeclaration
) : NfaDeclaration {
    for (const transition of nfa.transitions) {
        const epsilonDstStateSet = transition.dstStateSets[transition.dstStateSets.length-1];
        const isTrivial = (
            epsilonDstStateSet.length == 1 &&
            countIncomingEdges(nfa, epsilonDstStateSet[0]) == 1 &&
            nfa.startState != epsilonDstStateSet[0] &&
            !nfa.acceptStates.includes(epsilonDstStateSet[0])
        );
        if (!isTrivial) {
            continue;
        }

        const epsilonTransition = nfa.transitions.find(t => t.srcState == epsilonDstStateSet[0]);
        if (epsilonTransition == undefined) {
            throw new Error(`State ${epsilonDstStateSet[0]} not found`);
        }

        /**
         * Only one edge going from `t.srcState` to `epsilonDstStateSet[0]`,
         * and it is epsilon.
         * It is trivial.
         *
         * We can remove `epsilonDstStateSet[0]`.
         * Move all of `epsilonDstStateSet[0]` outgoing edges to `t.srcState`.
         */
        const newDstStateSets = transition.dstStateSets.map((dstStateSet, index) => {
            const otherDstStateSet = epsilonTransition.dstStateSets[index];

            const newDstStateSet = (
                dstStateSet == epsilonDstStateSet ?
                [] :
                [...dstStateSet]
            );
            for (const dstState of otherDstStateSet) {
                if (!newDstStateSet.includes(dstState)) {
                    newDstStateSet.push(dstState);
                }
            }
            return newDstStateSet;
        });

        return {
            ...nfa,
            transitions : nfa.transitions
                .filter(t => t.srcState != epsilonDstStateSet[0])
                .map(t => {
                    if (t != transition) {
                        return t;
                    }
                    return {
                        srcState : t.srcState,
                        dstStateSets : newDstStateSets,
                    };
                }),
        };
    }

    return nfa;
}
export function removeTrivialEpsilonTransitions (
    nfa : NfaDeclaration
) : NfaDeclaration {
    while (true) {
        const nfa2 = tryRemoveOneTrivialEpsilonTransition(nfa);
        if (nfa == nfa2) {
            return nfa;
        } else {
            nfa = nfa2;
        }
    }
}
