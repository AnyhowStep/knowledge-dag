import {ReaDeclaration} from "../rea-declaration";

export function findStateNames (
    edges : ReaDeclaration["edges"]
) : Set<string> {
    const result = new Set<string>();

    for (const edge of edges) {
        result.add(edge.src);
        result.add(edge.dst);
    }

    return result;
}
