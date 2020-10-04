export interface NpdaTransition {
    readonly srcState : string,
    /**
     * `dstStateSetCollection[stringInput][stackInput][stackOutput] = dstStateSet`
     */
    readonly dstStateSetCollection : readonly (readonly (readonly (readonly string[])[])[])[],
}

/**
 * Each transition is,
 * ```
 * src | dst | string input | stack input | stack output
 * ```
 *
 * ----
 *
 * ```
 * |Npda| name
 * 0,1
 * 0,$
 * q1
 * q1 | q4
 * q1 | q2 | \varepsilon | \varepsilon | $
 * q2 | q2 | 0           | \varepsilon | 0
 * q2 | q3 | 1           | 0           | \varepsilon
 * q3 | q3 | 1           | 0           | \varepsilon
 * q3 | q4 | \varepsilon | $           | \varepsilon
 * ```
 */
export interface NpdaDeclaration {
    readonly name : string,
    readonly stringAlphabet : readonly string[],
    readonly stackAlphabet : readonly string[],
    readonly startState : string,
    readonly acceptStates : readonly string[],
    readonly transitions : readonly NpdaTransition[],
}
