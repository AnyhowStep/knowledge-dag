import {ReaDeclaration, ReaEdge} from "../rea-declaration";
import {RegularExpressionDeclaration, RegularExpressionType, RegularExpressionUtil} from "../../regular-expression";
import {ensureStartStateNoIncomingEdge} from "./ensure-start-state-no-incoming-edge";
import {ensureOneAcceptState} from "./ensure-one-accept-state";
import {ensureAcceptStateNoOutgoingEdge} from "./ensure-accept-state-no-outgoing-edge";
import {findStateNames} from "./find-state-names";
import {unionEdges} from "./union-edges";

export function toRegularExpression (
    rea : ReaDeclaration
) : RegularExpressionDeclaration {
    if (rea.acceptStates.length == 0) {
        return {
            name : rea.name,
            regularExpressionType : RegularExpressionType.VarNothing,
            identifier : "\\varnothing",
        };
    }
    rea = ensureStartStateNoIncomingEdge(rea);
    rea = ensureOneAcceptState(rea);
    rea = ensureAcceptStateNoOutgoingEdge(rea);

    /**
     * We want to eliminate all states except the start and accept state.
     */
    const states = findStateNames(rea.edges);
    states.delete(rea.startState);
    states.delete(rea.acceptStates[0]);

    let edges = unionEdges(rea.edges);

    for (const state of states) {
        const incomingEdges = edges.filter(e => {
            return e.src != state && e.dst == state;
        });
        const selfEdges = edges.filter(e => {
            return e.src == state && e.dst == state;
        });
        const outgoingEdges = edges.filter(e => {
            return e.src == state && e.dst != state;
        });
        const otherEdges = edges.filter(e => {
            return e.src != state && e.dst != state;
        });

        const cycleSubExpr : RegularExpressionDeclaration = (
            selfEdges.length == 0 ?
            {
                regularExpressionType : RegularExpressionType.VarEpsilon,
                identifier : "\\varepsilon",
            } :
            RegularExpressionUtil.union(...selfEdges.map(e => e.regularExpression))
        );
        const cycleExpr = RegularExpressionUtil.star(cycleSubExpr);

        const newEdges : ReaEdge[] = [];
        for (const incoming of incomingEdges) {
            for (const outgoing of outgoingEdges) {
                newEdges.push({
                    src : incoming.src,
                    dst : outgoing.dst,
                    regularExpression : RegularExpressionUtil.concat(
                        incoming.regularExpression,
                        cycleExpr,
                        outgoing.regularExpression
                    ),
                });
            }
        }

        edges = [
            ...otherEdges,
            ...newEdges,
        ];
        edges = unionEdges(edges);
    }

    if (edges.length == 0) {
        return {
            regularExpressionType : RegularExpressionType.VarNothing,
            identifier : "\\varnothing",
        };
    } else if (edges.length == 1) {
        return edges[0].regularExpression;
    } else {
        return RegularExpressionUtil.union(
            ...edges.map(e => e.regularExpression)
        );
    }
}
