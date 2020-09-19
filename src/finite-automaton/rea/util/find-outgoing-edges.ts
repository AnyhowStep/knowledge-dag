import {ReaDeclaration, ReaEdge} from "../rea-declaration";

export function findOutgoingEdges (
    rea : ReaDeclaration,
    state : string
) : ReaEdge[] {
    return rea.edges.filter(e => e.src == state);
}
