import {DfaDeclaration} from "../dfa-declaration";
import {isFailState} from "./is-fail-state";

interface GenerateLanguageImplArgs {
    readonly dfa : DfaDeclaration,
    readonly maxLength : number,

    readonly result : Set<string>,

    readonly curState : string,
    readonly word : string,
}

function generateLanguageImpl (
    {
        dfa,
        maxLength,

        result,

        curState,
        word
    } : GenerateLanguageImplArgs
) : void {
    if (dfa.acceptStates.includes(curState)) {
        result.add(word);
    }

    if (word.length >= maxLength) {
        return;
    }

    const transition = dfa.transitions.find(t => t.srcState == curState);
    if (transition == undefined) {
        return;
    }

    if (isFailState(dfa.acceptStates, transition)) {
        return;
    }

    for (let i=0; i<transition.dstStates.length; ++i) {
        const dstState = transition.dstStates[i];
        const letter = dfa.alphabet[i];

        generateLanguageImpl({
            dfa,
            maxLength,

            result,

            curState : dstState,
            word : word + letter,
        });
    }
}

export interface GenerateLanguageArgs {
    readonly dfa : DfaDeclaration,
    readonly maxLength : number,
}
export function generateLanguage (
    {
        dfa,
        maxLength,
    } : GenerateLanguageArgs
) : Set<string> {
    const result = new Set<string>();

    generateLanguageImpl({
        dfa,
        maxLength,

        result,

        curState : dfa.startState,
        word : "",
    });

    return result;
}
