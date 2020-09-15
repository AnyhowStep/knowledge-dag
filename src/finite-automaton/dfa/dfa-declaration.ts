export interface DfaTransition {
    readonly srcState : string,
    readonly dstStates : readonly string[],
}

export interface DfaDeclaration {
    readonly name : string,
    readonly alphabet : readonly string[],
    readonly startState : string,
    readonly acceptStates : readonly string[],
    readonly transitions : readonly DfaTransition[],
}
