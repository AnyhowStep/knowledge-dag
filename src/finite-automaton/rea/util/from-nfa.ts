import {NfaDeclaration} from "../../nfa";
import {ReaDeclaration, ReaEdge} from "../rea-declaration";
import {RegularExpressionType} from "../../regular-expression";

export function fromNfa (
    nfa : NfaDeclaration
) : ReaDeclaration {
    const name = nfa.name;
    const startState = nfa.startState;
    const acceptStates = nfa.acceptStates;
    const edges : ReaEdge[] = [];

    for (const transition of nfa.transitions) {
        for (let i=0; i<transition.dstStateSets.length; ++i) {
            const dstStateSet = transition.dstStateSets[i];
            const letter = nfa.alphabet[i] as string|undefined;
            for (const dstState of dstStateSet) {
                const edge = {
                    src : transition.srcState,
                    dst : dstState,
                    regularExpression : (
                        letter == undefined ?
                        {
                            regularExpressionType : RegularExpressionType.VarEpsilon,
                            identifier : "\\varepsilon",
                        } as const:
                        {
                            regularExpressionType : RegularExpressionType.Variable,
                            identifier : letter,
                        } as const
                    ),
                } as const;
                edges.push(edge);
            }
        }
    }

    return {
        name,
        startState,
        acceptStates,
        edges,
    };
}
