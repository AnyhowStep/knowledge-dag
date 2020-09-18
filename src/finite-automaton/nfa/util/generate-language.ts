import {NfaDeclaration} from "../nfa-declaration";
import {isFailState} from "./is-fail-state";

interface GenerateLanguageImplArgs {
    readonly nfa : NfaDeclaration,
    readonly maxLength : number,

    readonly result : Set<string>,

    readonly curState : string,
    readonly word : readonly string[],

    readonly epsilonCheck : readonly string[],
}

/**
 *
 * @todo Detect epsilon cycles. Do not allow epsilon cycles.
 * @todo Do not consider epsilons as part of the word.
 */
function generateLanguageImpl (
    {
        nfa,
        maxLength,

        result,

        curState,
        word,

        epsilonCheck,
    } : GenerateLanguageImplArgs
) : void {
    if (nfa.acceptStates.includes(curState) && word.length <= maxLength) {
        result.add(word.join(""));
    }

    if (word.length > maxLength) {
        return;
    }

    if (epsilonCheck.includes(curState)) {
        return;
    }

    const transition = nfa.transitions.find(t => t.srcState == curState);
    if (transition == undefined) {
        return;
    }

    if (isFailState(nfa.acceptStates, transition)) {
        return;
    }

    for (let i=0; i<transition.dstStateSets.length; ++i) {
        const dstStateSet = transition.dstStateSets[i];
        const letter = nfa.alphabet[i] as string|undefined;

        for (const dstState of dstStateSet) {

            if (letter == undefined) {
                generateLanguageImpl({
                    nfa,
                    maxLength,

                    result,

                    curState : dstState,
                    word,

                    epsilonCheck : [...epsilonCheck, curState],
                });
            } else {
                generateLanguageImpl({
                    nfa,
                    maxLength,

                    result,

                    curState : dstState,
                    word : [...word, letter],

                    epsilonCheck : [],
                });
            }
        }
    }
}

export interface GenerateLanguageArgs {
    readonly nfa : NfaDeclaration,
    readonly maxLength : number,
}
export function generateLanguage (
    {
        nfa,
        maxLength,
    } : GenerateLanguageArgs
) : Set<string> {
    const result = new Set<string>();

    generateLanguageImpl({
        nfa,
        maxLength,

        result,

        curState : nfa.startState,
        word : [],

        epsilonCheck : [],
    });

    return result;
}
