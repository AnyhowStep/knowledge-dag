import {ReaDeclaration} from "../rea-declaration";

export function newStateName (
    edges : ReaDeclaration["edges"],
    desiredNames : readonly string[],

) : string {
    let iterationCount = 0;

    while (true) {
        for (const desiredName of desiredNames) {
            const str = (
                iterationCount == 0 ?
                desiredName :
                `${desiredName}_${iterationCount}`
            );
            if (edges.every(t => t.src != str && t.dst != str)) {
                return str;
            }
        }
        ++iterationCount;
    }
}
