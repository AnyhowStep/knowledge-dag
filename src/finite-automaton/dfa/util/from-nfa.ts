import {NfaDeclaration, NfaTransition, NfaUtil} from "../../nfa";
import {DfaDeclaration} from "../dfa-declaration";
import {permuteWithRepetition} from "../../util/permute-with-repetition";

export function fromNfa (nfa : NfaDeclaration) : DfaDeclaration {
    const powerset = permuteWithRepetition([true, false], nfa.transitions.length);
    const states : {
        readonly name : string,
        readonly subStates : readonly NfaTransition[],
    }[] = [];

    for (const arr of powerset) {
        const subStates : NfaTransition[] = [];

        for (let i=0; i<arr.length; ++i) {
            const include = arr[i];
            if (include) {
                const subState = nfa.transitions[i];
                subStates.push(subState);
            }
        }

        const stateName = `\\{${subStates.map(subState => subState.srcState).join(", ")}\\}`;
        states.push({
            name : stateName,
            subStates,
        });
    }

    //Compute start state
    const startStateSet = new Set<string>();
    const epsilonTransitions = NfaUtil.getEpsilonTransitions(
        nfa.startState,
        nfa.transitions
    );
    for (const epsilonTransition of epsilonTransitions) {
        startStateSet.add(epsilonTransition.srcState);
    }
    const startStateSet2 = [...startStateSet];
    const startState = states.find(state => {
        return (
            state.subStates.every(subState => startStateSet.has(subState.srcState)) &&
            startStateSet2.every(dstState => state.subStates.some(subState => subState.srcState == dstState))
        );
    });
    if (startState == undefined) {
        throw new Error(`Cannot find start state ${[...startStateSet].join(",")}`);
    }

    return {
        name : nfa.name,
        alphabet : nfa.alphabet,
        startState : startState.name,
        acceptStates : states
            .filter(state => {
                return state.subStates.some(subState => nfa.acceptStates.includes(subState.srcState));
            })
            .map(state => state.name),
        transitions : states.map(state => {
            return {
                srcState : state.name,
                dstStates : nfa.alphabet.map((_letter, index) => {
                    const dstStateSet = new Set<string>();
                    //handle alphabet transitions
                    for (const subState of state.subStates) {
                        for (const dstState of subState.dstStateSets[index]) {
                            dstStateSet.add(dstState);

                            //handle epsilon transitions
                            const epsilonTransitions = NfaUtil.getEpsilonTransitions(
                                dstState,
                                nfa.transitions
                            );
                            for (const epsilonTransition of epsilonTransitions) {
                                dstStateSet.add(epsilonTransition.srcState);
                            }
                        }
                    }

                    //find dstState containing sub states
                    const dstStateSet2 = [...dstStateSet];
                    const dstState = states.find(state => {
                        return (
                            state.subStates.every(subState => dstStateSet.has(subState.srcState)) &&
                            dstStateSet2.every(dstState => state.subStates.some(subState => subState.srcState == dstState))
                        );
                    });
                    if (dstState == undefined) {
                        throw new Error(`Cannot find dstState ${dstStateSet2.join(",")}`);
                    }
                    return dstState.name;
                }),
            };
        }),
    };
}
