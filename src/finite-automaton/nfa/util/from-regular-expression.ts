import {RegularExpressionDeclaration, RegularExpressionType, RegularExpressionUtil} from "../../regular-expression";
import {NfaDeclaration} from "../nfa-declaration";
import {concatenation} from "./concatenation";
import {union} from "./union";
import {removeTrivialEpsilonTransitions} from "./remove-trivial-epsilon-transitions";

export function fromRegularExpression (
    regularExpression : RegularExpressionDeclaration,
    getNextStateName : () => string,
) : NfaDeclaration {
    switch (regularExpression.regularExpressionType) {
        case RegularExpressionType.Parentheses: {
            return fromRegularExpression(
                regularExpression.subExpr,
                getNextStateName
            );
        }
        case RegularExpressionType.Variable: {
            const startState = getNextStateName();
            const acceptState = getNextStateName();
            return {
                name : regularExpression.identifier,
                alphabet : [regularExpression.identifier],
                startState,
                acceptStates : [acceptState],
                transitions : [
                    {
                        srcState : startState,
                        dstStateSets : [
                            [acceptState],
                            [],
                        ],
                    },
                    {
                        srcState : acceptState,
                        dstStateSets : [
                            [],
                            [],
                        ],
                    },
                ],
            };
        }
        case RegularExpressionType.Star: {
            const startState = getNextStateName();
            const acceptState = getNextStateName();

            const subExpr = regularExpression.subExpr;

            const nfa = fromRegularExpression(
                subExpr,
                getNextStateName
            );

            return {
                name : RegularExpressionUtil.toString(regularExpression),
                alphabet : nfa.alphabet,
                startState,
                acceptStates : [acceptState],
                transitions : [
                    {
                        srcState : startState,
                        dstStateSets : [
                            ...nfa.alphabet.map(() => []),
                            [
                                nfa.startState,
                                acceptState,
                            ],
                        ],
                    },
                    {
                        srcState : acceptState,
                        dstStateSets : [
                            ...nfa.alphabet.map(() => []),
                            [],
                        ],
                    },
                    ...nfa.transitions.map(t => {
                        if (nfa.acceptStates.includes(t.srcState)) {
                            const newDstStateSets = [...t.dstStateSets];
                            const oldEpsilonStateSet = newDstStateSets.pop();
                            if (oldEpsilonStateSet == undefined) {
                                throw new Error(`Missing epsilon state set`);
                            }
                            const newEpsilonStateSet = [
                                ...oldEpsilonStateSet,
                                nfa.startState,
                                acceptState,
                            ];
                            return {
                                srcState : t.srcState,
                                dstStateSets : [
                                    ...newDstStateSets,
                                    newEpsilonStateSet,
                                ],
                            };
                        } else {
                            return t;
                        }
                    }),
                ],
            };
        }
        case RegularExpressionType.Concat: {
            const lhs = fromRegularExpression(regularExpression.lhs, getNextStateName);
            const rhs = fromRegularExpression(regularExpression.rhs, getNextStateName);
            let nfa = concatenation(
                lhs,
                rhs
            );
            nfa = removeTrivialEpsilonTransitions(nfa);
            return {
                name : RegularExpressionUtil.toString(regularExpression),
                ...nfa,
            };
        }
        case RegularExpressionType.Union: {
            const lhs = fromRegularExpression(regularExpression.lhs, getNextStateName);
            const rhs = fromRegularExpression(regularExpression.rhs, getNextStateName);
            const nfa = union(
                lhs,
                rhs
            );
            return {
                name : RegularExpressionUtil.toString(regularExpression),
                ...nfa,
            };
        }
    }
}
