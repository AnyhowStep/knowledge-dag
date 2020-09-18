import * as nfa1 from "./nfa1.json";
import * as nfa2 from "./nfa2.json";
import * as nfa3 from "./nfa3.json";
import * as nfa4 from "./nfa4.json";
import * as nfa5 from "./nfa5.json";
import * as nfa6 from "./nfa6.json";
import * as nfa7 from "./nfa7.json";
import {NfaDeclaration, NfaUtil} from "../../../../../dist/finite-automaton";

export const nfaCollection : readonly NfaDeclaration[] = [
    nfa1,
    nfa2,
    nfa3,
    nfa4,
    nfa5,
    nfa6,
    nfa7,
];

export const language10Collection = nfaCollection.map(nfa => {
    return {
        nfa,
        language10 : NfaUtil.generateLanguage({
            nfa,
            maxLength : 10,
        }),
    };
});

export function isSubSet (a : Set<string>, b : Set<string>) {
    for (const wordA of a.values()) {
        if (!b.has(wordA)) {
            return false;
        }
    }
    return true;
}

export function findExtraValues (a : Set<string>, b : Set<string>) {
    const result : string[] = [];
    for (const wordA of a.values()) {
        if (!b.has(wordA)) {
            result.push(wordA);
        }
    }
    return result;
}
