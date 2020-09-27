export enum CfgSubstringType {
    Variable = "Variable",
    Terminal = "Terminal",
}

export interface CfgSubstringVariable {
    readonly subStringType : CfgSubstringType.Variable;
    readonly identifier : string;
}

export interface CfgSubstringTerminal {
    readonly subStringType : CfgSubstringType.Terminal;
    readonly value : string;
}

export type CfgString = readonly (CfgSubstringVariable|CfgSubstringTerminal)[];

export interface CfgRule {
    readonly variable : string;
    readonly strings : readonly CfgString[];
}

/**
 * Start variable is the variable of the first rule.
 */
export interface CfgDeclaration {
    readonly name? : string,
    readonly rules : readonly CfgRule[];
}
