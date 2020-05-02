import * as tape from "tape";
import * as dag from "../../../../dist/dag";
import {nodes} from "./nodes.json";
import {edges} from "./edges.json";

function pathToAncestor (
    from : string,
    to : string,
    path : readonly string[] = [],
    closed : Set<string> = new Set<string>()
) {
    if (from == to) {
        console.log(path);
    }

    if (closed.has(from)) {
        return;
    }
    closed.add(from);

    const parents = edges
        .filter(edge => edge.nodeId == from)
        .map(edge => edge.parentId);

    for (const parent of parents) {
        pathToAncestor(parent, to, [...path, from], closed);
    }
}

//eslint-disable-next-line @typescript-eslint/no-misused-promises
tape(__filename, async (t) => {
    const unusedNodes = new Set<string>();
    for (const node of nodes) {
        unusedNodes.add(node.nodeId);
    }

    const directEdges = new Map<string, boolean>();

    while (unusedNodes.size > 0) {
        const iteratorResult = unusedNodes.values().next();
        const id = iteratorResult.value;

        const result = await dag.calculateDirectParents({
            id,
            fetchAllParent  : (nodeId) => {
                return Promise.resolve(
                    edges
                        .filter(edge => edge.nodeId == nodeId)
                        .map(edge => edge.parentId)
                );
            },
            fetchAllChild   : (parentId) => {
                return Promise.resolve(
                    edges
                        .filter(edge => edge.parentId == parentId)
                        .map(edge => edge.nodeId)
                );
            },
            setDirectParent : (nodeId, parentId, direct) => {
                directEdges.set(`${nodeId}-${parentId}`, direct);
                return Promise.resolve();
            },
        });

        for (const nodeId of result.node) {
            if (unusedNodes.has(nodeId)) {
                unusedNodes.delete(nodeId);
            } else {
                t.fail(`Unexpected node ${nodeId}`);
            }
        }
    }

    t.deepEqual(directEdges.size, edges.length);
    for (const edge of edges) {
        const key = `${edge.nodeId}-${edge.parentId}`;
        const actual = directEdges.get(key);
        const expected = edge.direct;
        if (actual != expected) {
            pathToAncestor(edge.nodeId, edge.parentId);
            //This will fail
            t.deepEqual(actual, expected, key);
        }
    }


    t.end();
});
