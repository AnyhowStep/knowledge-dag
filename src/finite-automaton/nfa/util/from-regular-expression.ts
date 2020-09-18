import {RegularExpressionDeclaration, RegularExpressionType, RegularExpressionUtil} from "../../regular-expression";
import {NfaDeclaration} from "../nfa-declaration";
import {concatenation} from "./concatenation";
import {union} from "./union";

export function fromRegularExpression (
    regularExpression : RegularExpressionDeclaration,
    getNextStateName : () => string,
) : NfaDeclaration {
    switch (regularExpression.regularExpressionType) {
        case RegularExpressionType.Parentheses: {
            return fromRegularExpression(
                regularExpression.regularExpression,
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

            const subExpr = regularExpression.regularExpression;

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
                            [],
                            [
                                nfa.startState,
                                acceptState,
                            ],
                        ],
                    },
                    {
                        srcState : acceptState,
                        dstStateSets : [
                            [],
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
            const nfa = regularExpression.regularExpressions.reduce<NfaDeclaration|undefined>(
                (nfa, subExpr) => {
                    if (nfa == undefined) {
                        return fromRegularExpression(subExpr, getNextStateName);
                    } else {
                        return concatenation(nfa, fromRegularExpression(subExpr, getNextStateName));
                    }
                },
                undefined
            );
            if (nfa == undefined) {
                //Or maybe we should allow it and define it to be the empty language?
                throw new Error(`Cannot concat zero regular expressions`);
            }
            return {
                name : RegularExpressionUtil.toString(regularExpression),
                ...nfa,
            };
        }
        case RegularExpressionType.Union: {
            const nfa = regularExpression.regularExpressions.reduce<NfaDeclaration|undefined>(
                (nfa, subExpr) => {
                    if (nfa == undefined) {
                        return fromRegularExpression(subExpr, getNextStateName);
                    } else {
                        return union(nfa, fromRegularExpression(subExpr, getNextStateName));
                    }
                },
                undefined
            );
            if (nfa == undefined) {
                //Or maybe we should allow it and define it to be the empty language?
                throw new Error(`Cannot union zero regular expressions`);
            }
            return {
                name : RegularExpressionUtil.toString(regularExpression),
                ...nfa,
            };
        }
    }
}
