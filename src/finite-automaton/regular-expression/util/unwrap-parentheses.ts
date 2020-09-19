import {RegularExpressionDeclaration, RegularExpression_Parentheses, RegularExpressionType} from "../regular-expression-declaration";

export function unwrapParentheses (
    regularExpression : RegularExpressionDeclaration
) : Exclude<RegularExpressionDeclaration, RegularExpression_Parentheses> {
    while (regularExpression.regularExpressionType == RegularExpressionType.Parentheses) {
        regularExpression = regularExpression.subExpr;
    }
    return regularExpression;
}
