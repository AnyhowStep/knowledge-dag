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

export interface CfgRule {
    readonly variable : string;
    readonly str : readonly (CfgSubstringVariable|CfgSubstringTerminal)[];
}

/**
 * Start variable is the variable of the first rule.
 */
export interface CfgDeclaration {
    readonly rules : readonly CfgRule[];
}
