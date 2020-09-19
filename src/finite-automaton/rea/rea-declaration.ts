import {RegularExpressionDeclaration} from "../regular-expression";

export interface ReaEdge {
    readonly src : string;
    readonly dst : string;
    readonly regularExpression : RegularExpressionDeclaration;
}
/**
 * Regular Expression Automaton
 */
export interface ReaDeclaration {
    readonly name : string;
    readonly startState : string;
    readonly acceptStates : readonly string[];
    readonly edges : readonly ReaEdge[];
}
