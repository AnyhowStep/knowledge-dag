import {DfaDeclaration} from "../dfa-declaration";

/**
 * + Assumes no repeats in `alphabet1`
 * + Assumes no repeats in `alphabet2`
 */
export function mergeAlphabet (
    alphabet1 : DfaDeclaration["alphabet"],
    alphabet2 : DfaDeclaration["alphabet"]
) : DfaDeclaration["alphabet"] {

    const alphabet = [...alphabet1];
    for (const a2 of alphabet2) {
        if (!alphabet.includes(a2)) {
            alphabet.push(a2);
        }
    }
    return alphabet;
}
