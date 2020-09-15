import {DfaDeclaration} from "../dfa-declaration";
import {findFailStates} from "./find-fail-states";
import {newStateName} from "./new-state-name";

export interface FindOrCreateFailStateResult {
    readonly dfa : DfaDeclaration,
    readonly failState : string,
}

export function findOrCreateFailState (
    dfa : DfaDeclaration
) : FindOrCreateFailStateResult {
    const existingFailStates = findFailStates(dfa);

    if (existingFailStates.length == 0) {
        const failState = newStateName(
            dfa.transitions,
            [
                `${dfa.name}_{fail}`,
                `${dfa.name}_{abort}`,
                `${dfa.name}_{stall}`,
                `${dfa.name}_{sink}`,
            ]
        );
        return {
            dfa : {
                ...dfa,
                transitions : [
                    ...dfa.transitions,
                    {
                        srcState : failState,
                        dstStates : dfa.alphabet.map(() => failState),
                    },
                ],
            },
            failState,
        };
    } else {
        return {
            dfa,
            failState : existingFailStates[0].srcState,
        };
    }
}
