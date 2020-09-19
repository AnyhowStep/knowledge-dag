import {RegularExpressionDeclaration, RegularExpressionType} from "../regular-expression-declaration";
import {unwrapParentheses} from "./unwrap-parentheses";

export function star (
    regularExpression : RegularExpressionDeclaration
) : RegularExpressionDeclaration {
    regularExpression = unwrapParentheses(regularExpression);

    if (
        regularExpression.regularExpressionType == RegularExpressionType.VarEpsilon ||
        regularExpression.regularExpressionType == RegularExpressionType.VarNothing
    ) {
        return {
            regularExpressionType : RegularExpressionType.VarEpsilon,
            identifier : "\\varepsilon",
        };
    }

    return {
        regularExpressionType : RegularExpressionType.Star,
        subExpr : regularExpression,
    };
}
