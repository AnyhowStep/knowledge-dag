export interface NfaTransition {
    readonly srcState : string,
    readonly dstStateSets : readonly (readonly string[])[],
}

export interface NfaDeclaration {
    readonly name : string,
    readonly alphabet : readonly string[],
    readonly startState : string,
    readonly acceptStates : readonly string[],
    readonly transitions : readonly NfaTransition[],
}
