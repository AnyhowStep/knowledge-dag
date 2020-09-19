import {ReaDeclaration} from "../rea-declaration";
import {newStateName} from "./new-state-name";
import {RegularExpressionType} from "../../regular-expression";
import {findOutgoingEdges} from "./find-outgoing-edges";

export function ensureAcceptStateNoOutgoingEdge (
    rea : ReaDeclaration
) : ReaDeclaration {
    if (rea.acceptStates.length != 1) {
        throw new Error(`Must have exactly one accept state`);
    }

    if (findOutgoingEdges(rea, rea.acceptStates[0]).length == 0) {
        return rea;
    }

    const newAcceptState = newStateName(
        rea.edges,
        [
            `${rea.name}_{accept}`,
            `${rea.name}_{ok}`,
            `${rea.name}_{good}`,
        ]
    );

    return {
        ...rea,
        acceptStates : [newAcceptState],
        edges : [
            ...rea.edges,
            {
                src : rea.acceptStates[0],
                dst : newAcceptState,
                regularExpression : {
                    regularExpressionType : RegularExpressionType.VarEpsilon,
                    identifier : "\\varepsilon"
                },
            },
        ],
    };
}
