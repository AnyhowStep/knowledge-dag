import {ReaDeclaration} from "../rea-declaration";
import {findIncomingEdges} from "./find-incoming-edges";
import {newStateName} from "./new-state-name";
import {RegularExpressionType} from "../../regular-expression";

export function ensureStartStateNoIncomingEdge (
    rea : ReaDeclaration
) : ReaDeclaration {
    if (findIncomingEdges(rea, rea.startState).length == 0) {
        return rea;
    }

    const newStartState = newStateName(
        rea.edges,
        [
            `${rea.name}_{start}`,
            `${rea.name}_{begin}`,
            `${rea.name}_{head}`,
            `${rea.name}_{source}`,
        ]
    );

    return {
        ...rea,
        startState : newStartState,
        edges : [
            ...rea.edges,
            {
                src : newStartState,
                dst : rea.startState,
                regularExpression : {
                    regularExpressionType : RegularExpressionType.VarEpsilon,
                    identifier : "\\varepsilon"
                },
            },
        ],
    };
}
