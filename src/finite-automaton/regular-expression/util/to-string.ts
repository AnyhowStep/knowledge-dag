import {RegularExpressionDeclaration, RegularExpressionType} from "../regular-expression-declaration";

export function toString (
    regularExpression : RegularExpressionDeclaration
) : string {
    switch (regularExpression.regularExpressionType) {
        case RegularExpressionType.Parentheses:
            return `(${toString(regularExpression.subExpr)})`;
        case RegularExpressionType.Variable:
            return regularExpression.identifier;
        case RegularExpressionType.Star: {
            const subExpr = regularExpression.subExpr;
            switch (subExpr.regularExpressionType) {
                case RegularExpressionType.Parentheses:
                case RegularExpressionType.Variable:
                    return `${toString(subExpr)}*`;
                case RegularExpressionType.Star:
                    return toString(subExpr);
                case RegularExpressionType.Concat:
                case RegularExpressionType.Union:
                    return `(${toString(subExpr)})*`;
            }
            throw new Error(`Unimplemented ${(subExpr as RegularExpressionDeclaration).regularExpressionType}*`);
        }
        case RegularExpressionType.Concat: {
            const arr = [regularExpression.lhs, regularExpression.rhs].map((subExpr) : string => {
                switch (subExpr.regularExpressionType) {
                    case RegularExpressionType.Parentheses:
                    case RegularExpressionType.Variable:
                    case RegularExpressionType.Star:
                    case RegularExpressionType.Concat:
                        return toString(subExpr);
                    case RegularExpressionType.Union:
                        return `(${toString(subExpr)})`;
                }
            });
            return arr.join("");
        }
        case RegularExpressionType.Union: {
            const arr = [regularExpression.lhs, regularExpression.rhs].map((subExpr) : string => {
                return toString(subExpr);
            });
            return arr.join(" \\cup ");
        }
    }
}
