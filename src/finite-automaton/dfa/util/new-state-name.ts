import {DfaDeclaration} from "../dfa-declaration";

export function newStateName (
    transitions : DfaDeclaration["transitions"],
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
