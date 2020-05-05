import {RegexStream} from "flavormark";

/*
    T = true
    F = false
    [a-z][a-z0-9\_\^\{\}]* = variable
    ( and ) = Parentheses for grouping operations
    \neg   = NOT
    \wedge = AND
    \vee   = OR

    \rightarrow = CONDITIONAL
    \leftrightarrow = BICONDITIONAL
    \oplus = XOR

    -----

    For computer science, we have,

    (0|1)+    = bit string constant
    ~ (tilde) = NOT
    &         = AND
    |         = OR
    ^         = XOR
*/
export interface PropositionToken {
    type  : (
        "true"|"false"|"variable"|
        "open-parentheses"|"close-parentheses"|
        "not"|"and"|"or"|"conditional"|"biconditional"|"xor"|
        "bit-string"
    ),
    value : string,
    position : number,
    precedence : number,
}
export function isValue (token : PropositionToken) {
    switch (token.type) {
        case "true":
        case "false":
        case "variable":
        case "bit-string": {
            return true;
        }
        default: {
            return false;
        }
    }
}
export function isBinaryOp (token : PropositionToken) {
    switch (token.type) {
        case "and":
        case "or":
        case "conditional":
        case "biconditional":
        case "xor": {
            return true;
        }
        default: {
            return false;
        }
    }
}
export function isBooleanOp (token : PropositionToken) {
    switch (token.value) {
        case "\\neg":
        case "\\wedge":
        case "\\vee":
        case "\\rightarrow":
        case "\\leftrightarrow":
        case "\\oplus": {
            return true;
        }
        default: {
            return false;
        }
    }
}
const TokenMatchers : { type : PropositionToken["type"], regex : RegExp, precedence : number }[] = [
    { type : "true", regex : /^T/, precedence : -99 },
    { type : "false", regex : /^F/, precedence : -99 },
    { type : "variable", regex : /^[a-z][a-z0-9\_\^\{\}]*/, precedence : -99 },
    { type : "open-parentheses", regex : /^\(/, precedence : 99 },
    { type : "close-parentheses", regex : /^\)/, precedence : -99 },
    { type : "not", regex : /^(\\neg|\~)/, precedence : 3 },
    { type : "and", regex : /^(\\wedge|\&)/, precedence : 2 },
    { type : "or", regex : /^(\\vee|\|)/, precedence : 1 },
    { type : "conditional", regex : /^\\rightarrow/, precedence : 0 },
    { type : "biconditional", regex : /^\\leftrightarrow/, precedence : 0 },
    { type : "xor", regex : /^(\\oplus|\^)/, precedence : 0 },

    { type : "bit-string", regex : /^(0|1)+/, precedence : -99 },
];
export class PropositionTokenizer {
    public static tokenize (raw : string) : PropositionToken[] {
        const stream = new RegexStream(raw);

        const result : PropositionToken[] = [];
        while (stream.hasCharacters()) {
            if (stream.match(/^\s+/) != undefined) {
                continue;
            }
            const position = stream.pos;
            let matched = false;
            for (let m of TokenMatchers) {
                const value = stream.match(m.regex);
                if (value != undefined) {
                    result.push({
                        type     : m.type,
                        value    : value,
                        position : position,
                        precedence : m.precedence,
                    });
                    matched = true;
                    break;
                }
            }
            if (!matched) {
                throw new Error(`Unknown token '${stream.subject.slice(stream.pos)}' at position ${stream.pos}`);
            }
        }
        return result;
    }
}
