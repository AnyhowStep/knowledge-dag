import {RegularExpressionType, RegularExpressionDeclaration} from "../regular-expression-declaration";
/*
function consumeChar (str : string, state : { index : number }, expectedChar : string) {
    if (str[state.index] == expectedChar) {
        ++state.index;
        return;
    }
    throw new Error(`Expected ${expectedChar}`);
}
*/
function tryConsumeChar (str : string, state : { index : number }, expectedChar : string) : boolean {
    if (str[state.index] == expectedChar) {
        ++state.index;
        return true;
    }
    return false;
}
/*
function consumeString (str : string, state : { index : number }, expectedString : string) {
    for (const c of expectedString) {
        consumeChar(str, state, c);
    }
}
*/
function tryConsumeString (str : string, state : { index : number }, expectedString : string) : boolean {
    const initialIndex = state.index;
    for (const c of expectedString) {
        if (!tryConsumeChar(str, state, c)) {
            state.index = initialIndex;
            return false;
        }
    }
    return true;
}

function consumeToken (tokens : Token[], state : { index : number }, expectedValue : string) {
    if (tokens[state.index].value == expectedValue) {
        ++state.index;
        return;
    }
    throw new Error(`Expected ${expectedValue}`);
}

interface Token {
    readonly regularExpressionType : RegularExpressionType;
    readonly value : string;
}

function tokenize (str : string, state : { index : number }) {
    const tokens : Token[] = [];
    while (state.index < str.length) {
        const value = str[state.index];
        ++state.index;

        switch (value) {
            case "(":
            case ")": {
                tokens.push({
                    regularExpressionType : RegularExpressionType.Parentheses,
                    value,
                });
                break;
            }
            case "*": {
                tokens.push({
                    regularExpressionType : RegularExpressionType.Star,
                    value,
                });
                break;
            }
            case "\\": {
                if (tryConsumeString(str, state, "circ")) {
                    tokens.push({
                        regularExpressionType : RegularExpressionType.Concat,
                        value : "\\circ",
                    });
                } else if (tryConsumeString(str, state, "cup")) {
                    tokens.push({
                        regularExpressionType : RegularExpressionType.Union,
                        value : "\\cup",
                    });
                } else {
                    throw new Error(`Expected \\circ or \\cup`);
                }
                break;
            }
            default: {
                if (!/\s/.test(value)) {
                    tokens.push({
                        regularExpressionType : RegularExpressionType.Variable,
                        value,
                    });
                }
            }
        }
    }
    return tokens;
}

function addExplicitConcatenations (tokens : Token[]) {
    for (let i=0; i<tokens.length-1; ++i) {
        const cur = tokens[i];
        const nxt = tokens[i+1];

        const curCanInsertConcat = (
            cur.regularExpressionType == RegularExpressionType.Parentheses && cur.value == ")" ||
            cur.regularExpressionType == RegularExpressionType.Variable ||
            cur.regularExpressionType == RegularExpressionType.Star
        );
        const nxtCanInsertConcat = (
            nxt.regularExpressionType == RegularExpressionType.Parentheses && nxt.value == "(" ||
            nxt.regularExpressionType == RegularExpressionType.Variable
        );

        if (curCanInsertConcat && nxtCanInsertConcat) {
            tokens.splice(
                i+1,
                0,
                {
                    regularExpressionType : RegularExpressionType.Concat,
                    value : "\\circ",
                }
            );
        }
    }
}

function parse (tokens : Token[], state : { index : number }) : RegularExpressionDeclaration {
    if (state.index >= tokens.length) {
        throw new Error(`EOF`);
    }
    const token = tokens[state.index];
    ++state.index;

    switch (token.value) {
        case "(": {
            const subExpr = parse(tokens, state);
            consumeToken(tokens, state, ")");
            return tryParseOp(
                tokens,
                state,
                {
                    regularExpressionType : RegularExpressionType.Parentheses,
                    subExpr,
                }
            );
        }
        case ")":
        case "*":
        case "\\circ":
        case "\\cup": {
            throw new Error(`Unexpected ${token.value}`);
        }
        default: {
            return tryParseOp(
                tokens,
                state,
                {
                    regularExpressionType : RegularExpressionType.Variable,
                    identifier : token.value,
                }
            );
        }
    }
}

function tryParseOp (
    tokens : Token[],
    state : { index : number },
    lhs : RegularExpressionDeclaration
) : RegularExpressionDeclaration {
    if (state.index >= tokens.length) {
        return lhs;
    }
    const token = tokens[state.index];
    ++state.index;

    switch (token.value) {
        case "(": {
            const subExpr = parse(tokens, state);
            consumeToken(tokens, state, ")");
            return tryParseOp(
                tokens,
                state,
                {
                    regularExpressionType : RegularExpressionType.Parentheses,
                    subExpr,
                }
            );
        }
        case ")": {
            --state.index;
            return lhs;
        }
        case "*": {
            return tryParseOp(
                tokens,
                state,
                {
                    regularExpressionType : RegularExpressionType.Star,
                    subExpr : lhs,
                }
            );
        }
        case "\\circ": {
            return {
                regularExpressionType : RegularExpressionType.Concat,
                lhs,
                rhs : parse(tokens, state),
            };
        }
        case "\\cup": {
            return {
                regularExpressionType : RegularExpressionType.Union,
                lhs,
                rhs : parse(tokens, state),
            };
        }
        default: {
            throw new Error(`Unexpected ${token.value}`);
        }
    }
}

export function fromString (str : string) {
    const tokens = tokenize(str, { index : 0 });
    addExplicitConcatenations(tokens);

    return parse(tokens, { index : 0 });
}
