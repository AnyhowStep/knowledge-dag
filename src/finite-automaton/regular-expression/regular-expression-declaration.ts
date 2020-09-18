/**
 * Minimally, we have,
 * + Parentheses
 * + Variable
 * + Star
 * + Concat
 * + Union
 */
export enum RegularExpressionType {
    Parentheses,
    Variable,
    Star,
    Concat,
    Union,
}
export interface RegularExpression_Parentheses {
    readonly regularExpressionType : RegularExpressionType.Parentheses;
    readonly regularExpression : RegularExpressionDeclaration;
}
export interface RegularExpression_Variable {
    readonly regularExpressionType : RegularExpressionType.Variable;
    readonly identifier : string;
}
export interface RegularExpression_Star {
    readonly regularExpressionType : RegularExpressionType.Star;
    readonly regularExpression : RegularExpressionDeclaration;
}
export interface RegularExpression_Concat {
    readonly regularExpressionType : RegularExpressionType.Concat;
    readonly regularExpressions : readonly RegularExpressionDeclaration[];
}
export interface RegularExpression_Union {
    readonly regularExpressionType : RegularExpressionType.Union;
    readonly regularExpressions : readonly RegularExpressionDeclaration[];
}
export type RegularExpressionDeclaration =
    | RegularExpression_Parentheses
    | RegularExpression_Variable
    | RegularExpression_Star
    | RegularExpression_Concat
    | RegularExpression_Union
;
