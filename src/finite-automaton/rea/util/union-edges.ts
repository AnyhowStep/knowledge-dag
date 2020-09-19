import {ReaDeclaration} from "../rea-declaration";
import {RegularExpressionUtil} from "../../regular-expression";

function tryUnionEdge (
    edges : ReaDeclaration["edges"]
) : ReaDeclaration["edges"] {
    for (const edge of edges) {
        const sameEdges = edges.filter(e => {
            return e.src == edge.src && e.dst == edge.dst;
        });
        if (sameEdges.length <= 1) {
            continue;
        }

        const unionExpr = RegularExpressionUtil.union(
            ...sameEdges.map(e => e.regularExpression)
        );

        const otherEdges = edges.filter(e => {
            return e.src != edge.src || e.dst != edge.dst;
        });

        return [
            ...otherEdges,
            {
                src : edge.src,
                dst : edge.dst,
                regularExpression : unionExpr,
            }
        ];
    }
    return edges;
}

export function unionEdges (
    edges : ReaDeclaration["edges"]
) : ReaDeclaration["edges"] {
    while (true) {
        const edges2 = tryUnionEdge(edges);
        if (edges == edges2) {
            return edges;
        } else {
            edges = edges2;
        }
    }
}
