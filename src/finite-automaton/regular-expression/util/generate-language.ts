import {RegularExpressionDeclaration} from "../regular-expression-declaration";
import {NfaUtil} from "../../nfa";

export interface GenerateLanguageArgs {
    readonly regularExpression : RegularExpressionDeclaration,
    readonly maxLength : number,
}
export function generateLanguage (
    {
        regularExpression,
        maxLength,
    } : GenerateLanguageArgs
) : Set<string> {
    let i = 0;
    let nfa = NfaUtil.fromRegularExpression(
        regularExpression,
        () => `q${++i}`
    );
    nfa = NfaUtil.removeInvalidTransitions(nfa);
    return NfaUtil.generateLanguage({
        nfa,
        maxLength,
    });
}
