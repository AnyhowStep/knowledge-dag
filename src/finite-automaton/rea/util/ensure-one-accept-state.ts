import {ReaDeclaration} from "../rea-declaration";
import {newStateName} from "./new-state-name";
import {RegularExpressionType} from "../../regular-expression";

export function ensureOneAcceptState (
    rea : ReaDeclaration
) : ReaDeclaration {
    if (rea.acceptStates.length <= 1) {
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
            ...rea.acceptStates.map(acceptState => {
                return {
                    src : acceptState,
                    dst : newAcceptState,
                    regularExpression : {
                        regularExpressionType : RegularExpressionType.VarEpsilon,
                        identifier : "\\varepsilon"
                    },
                } as const;
            }),
        ],
    };

}
