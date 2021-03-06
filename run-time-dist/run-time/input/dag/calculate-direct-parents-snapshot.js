"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tape = require("tape");
const dag = require("../../../../dist/dag");
const nodes_json_1 = require("./nodes.json");
const edges_json_1 = require("./edges.json");
function pathToAncestor(from, to, path = [], closed = new Set()) {
    if (from == to) {
        console.log(path);
    }
    if (closed.has(from)) {
        return;
    }
    closed.add(from);
    const parents = edges_json_1.edges
        .filter(edge => edge.nodeId == from)
        .map(edge => edge.parentId);
    for (const parent of parents) {
        pathToAncestor(parent, to, [...path, from], closed);
    }
}
//eslint-disable-next-line @typescript-eslint/no-misused-promises
tape(__filename, async (t) => {
    const unusedNodes = new Set();
    for (const node of nodes_json_1.nodes) {
        unusedNodes.add(node.nodeId);
    }
    const directEdges = new Map();
    while (unusedNodes.size > 0) {
        const iteratorResult = unusedNodes.values().next();
        const id = iteratorResult.value;
        const result = await dag.calculateDirectParents({
            id,
            fetchAllParent: (nodeId) => {
                return Promise.resolve(edges_json_1.edges
                    .filter(edge => edge.nodeId == nodeId)
                    .map(edge => edge.parentId));
            },
            fetchAllChild: (parentId) => {
                return Promise.resolve(edges_json_1.edges
                    .filter(edge => edge.parentId == parentId)
                    .map(edge => edge.nodeId));
            },
            setDirectParent: (nodeId, parentId, direct) => {
                directEdges.set(`${nodeId}-${parentId}`, direct);
                return Promise.resolve();
            },
        });
        for (const nodeId of result.node) {
            if (unusedNodes.has(nodeId)) {
                unusedNodes.delete(nodeId);
            }
            else {
                t.fail(`Unexpected node ${nodeId}`);
            }
        }
    }
    t.deepEqual(directEdges.size, edges_json_1.edges.length);
    for (const edge of edges_json_1.edges) {
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
//# sourceMappingURL=calculate-direct-parents-snapshot.js.map