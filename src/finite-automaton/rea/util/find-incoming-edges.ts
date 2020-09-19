import {ReaDeclaration, ReaEdge} from "../rea-declaration";

export function findIncomingEdges (
    rea : ReaDeclaration,
    state : string
) : ReaEdge[] {
    return rea.edges.filter(e => e.dst == state);
}
