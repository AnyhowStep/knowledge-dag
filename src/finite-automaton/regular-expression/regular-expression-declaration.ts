/**
 * Minimally, we have,
 * + Parentheses
 * + Variable
 * + Star
 * + Concat
 * + Union
 */
export enum RegularExpressionType {
    Parentheses = "Parentheses",
    Variable    = "Variable",
    VarEpsilon  = "VarEpsilon",
    VarNothing  = "VarNothing",
    Star        = "Star",
    Concat      = "Concat",
    Union       = "Union",
}
export interface RegularExpression_Parentheses {
    readonly name? : string;
    readonly regularExpressionType : RegularExpressionType.Parentheses;
    readonly subExpr : RegularExpressionDeclaration;
}
export interface RegularExpression_Variable {
    readonly name? : string;
    readonly regularExpressionType : RegularExpressionType.Variable;
    readonly identifier : string;
}
export interface RegularExpression_VarEpsilon {
    readonly name? : string;
    readonly regularExpressionType : RegularExpressionType.VarEpsilon;
    readonly identifier : string;
}
export interface RegularExpression_VarNothing {
    readonly name? : string;
    readonly regularExpressionType : RegularExpressionType.VarNothing;
    readonly identifier : string;
}
export interface RegularExpression_Star {
    readonly name? : string;
    readonly regularExpressionType : RegularExpressionType.Star;
    readonly subExpr : RegularExpressionDeclaration;
}
export interface RegularExpression_Concat {
    readonly name? : string;
    readonly regularExpressionType : RegularExpressionType.Concat;
    readonly lhs : RegularExpressionDeclaration;
    readonly rhs : RegularExpressionDeclaration;
}
export interface RegularExpression_Union {
    readonly name? : string;
    readonly regularExpressionType : RegularExpressionType.Union;
    readonly lhs : RegularExpressionDeclaration;
    readonly rhs : RegularExpressionDeclaration;
}
export type RegularExpressionDeclaration =
    | RegularExpression_Parentheses
    | RegularExpression_Variable
    | RegularExpression_VarEpsilon
    | RegularExpression_VarNothing
    | RegularExpression_Star
    | RegularExpression_Concat
    | RegularExpression_Union
;
