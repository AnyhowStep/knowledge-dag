import {RegularExpressionDeclaration, RegularExpression_Union, RegularExpressionType} from "../regular-expression-declaration";
import {unwrapParentheses} from "./unwrap-parentheses";

/**
 *
 * @todo Remove duplicate regular expressions
 */
export function union (
    ...regularExpressions : readonly RegularExpressionDeclaration[]
) : RegularExpressionDeclaration {
    regularExpressions = regularExpressions.map(unwrapParentheses);

    if (regularExpressions.length == 0) {
        return {
            regularExpressionType : RegularExpressionType.VarNothing,
            identifier : "\\varnothing",
        };
    }

    if (regularExpressions.length == 1) {
        return regularExpressions[0];
    }

    /**
     * + `\\varnothing \\cup a = a`
     * + `a \\cup \\varnothing = a`
     */
    regularExpressions = regularExpressions.filter(re => re.regularExpressionType != RegularExpressionType.VarNothing);

    if (regularExpressions.length == 0) {
        return {
            regularExpressionType : RegularExpressionType.VarNothing,
            identifier : "\\varnothing",
        };
    }

    if (regularExpressions.length == 1) {
        return regularExpressions[0];
    }

    let result : RegularExpression_Union = {
        regularExpressionType : RegularExpressionType.Union,
        lhs : regularExpressions[0],
        rhs : regularExpressions[1],
    };
    for (let i=2; i<regularExpressions.length; ++i) {
        result = {
            regularExpressionType : RegularExpressionType.Union,
            lhs : result,
            rhs : regularExpressions[i],
        };
    }
    return result;
}
