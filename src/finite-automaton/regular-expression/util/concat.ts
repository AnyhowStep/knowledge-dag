import {RegularExpressionDeclaration, RegularExpressionType, RegularExpression_Concat} from "../regular-expression-declaration";
import {unwrapParentheses} from "./unwrap-parentheses";

/**
 *
 * @todo Remove duplicate regular expressions
 */
export function concat (
    ...regularExpressions : readonly RegularExpressionDeclaration[]
) : RegularExpressionDeclaration {
    regularExpressions = regularExpressions.map(unwrapParentheses);

    if (regularExpressions.some(re => re.regularExpressionType == RegularExpressionType.VarNothing)) {
        /**
         * + `\\varnothing \\circ a = \\varnothing`
         * + `a \\circ \\varnothing = \\varnothing`
         */
        return {
            regularExpressionType : RegularExpressionType.VarNothing,
            identifier : "\\varnothing",
        };
    }

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
     * + `\\varepsilon \\circ a = a`
     * + `a \\circ \\varepsilon = a`
     */
    regularExpressions = regularExpressions.filter(re => re.regularExpressionType != RegularExpressionType.VarEpsilon);

    if (regularExpressions.length == 0) {
        return {
            regularExpressionType : RegularExpressionType.VarEpsilon,
            identifier : "\\varepsilon",
        };
    }

    if (regularExpressions.length == 1) {
        return regularExpressions[0];
    }

    let result : RegularExpression_Concat = {
        regularExpressionType : RegularExpressionType.Concat,
        lhs : regularExpressions[0],
        rhs : regularExpressions[1],
    };
    for (let i=2; i<regularExpressions.length; ++i) {
        result = {
            regularExpressionType : RegularExpressionType.Concat,
            lhs : result,
            rhs : regularExpressions[i],
        };
    }
    return result;
}
