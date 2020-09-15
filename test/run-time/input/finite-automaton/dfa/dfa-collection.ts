import * as dfa1 from "./dfa1.json";
import * as dfa2 from "./dfa2.json";
import * as dfa3 from "./dfa3.json";
import * as dfa4 from "./dfa4.json";
import * as dfa5 from "./dfa5.json";
import * as dfa6 from "./dfa6.json";
import * as dfa7 from "./dfa7.json";
import * as dfa8 from "./dfa8.json";
import * as dfa9 from "./dfa9.json";
import * as dfa10 from "./dfa10.json";
import * as dfa11 from "./dfa11.json";
import * as dfa12 from "./dfa12.json";
import * as dfa13 from "./dfa13.json";
import {DfaDeclaration, DfaUtil} from "../../../../../dist/finite-automaton";

export const dfaCollection : readonly DfaDeclaration[] = [
    dfa1,
    dfa2,
    dfa3,
    dfa4,
    dfa5,
    dfa6,
    dfa7,
    dfa8,
    dfa9,
    dfa10,
    dfa11,
    dfa12,
    dfa13,
];

export const language10Collection = dfaCollection.map(dfa => {
    return {
        dfa,
        language10 : DfaUtil.generateLanguage({
            dfa,
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
