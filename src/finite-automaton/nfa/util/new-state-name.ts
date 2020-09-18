import {NfaDeclaration} from "../nfa-declaration";

export function newStateName (
    transitions : NfaDeclaration["transitions"],
    desiredNames : readonly string[],
    iterationCount = 0,
) : string {
    for (const desiredName of desiredNames) {
        const str = (
            iterationCount == 0 ?
            desiredName :
            `${desiredName}_${iterationCount}`
        );
        if (transitions.every(t => t.srcState != str)) {
            return str;
        }
    }
    return newStateName(
        transitions,
        desiredNames,
        iterationCount+1
    );
}
