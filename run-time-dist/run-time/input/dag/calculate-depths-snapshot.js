"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tape = require("tape");
const dag = require("../../../../dist/dag");
const nodes_json_1 = require("./nodes.json");
const edges_json_1 = require("./edges.json");
//import * as fs from "fs";
//eslint-disable-next-line @typescript-eslint/no-misused-promises
tape(__filename, async (t) => {
    const unusedNodes = new Set();
    for (const node of nodes_json_1.nodes) {
        unusedNodes.add(node.nodeId);
    }
    const newNodes = [];
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
            setDirectParent: () => {
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
        const depths = await dag.calculateDepths({
            root: result.root,
            leaf: result.leaf,
            fetchAllDirectParent: (nodeId) => {
                return Promise.resolve(edges_json_1.edges
                    .filter(edge => edge.nodeId == nodeId && edge.direct == true)
                    .map(edge => edge.parentId));
            },
            fetchAllDirectChild: (parentId) => {
                return Promise.resolve(edges_json_1.edges
                    .filter(edge => edge.parentId == parentId && edge.direct == true)
                    .map(edge => edge.nodeId));
            },
        });
        t.deepEqual(depths.size, result.node.size);
        for (const nodeId of result.node) {
            const actual = depths.get(nodeId);
            //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const expected = nodes_json_1.nodes.find(node => node.nodeId == nodeId).depth;
            if (actual != expected) {
                t.deepEqual(actual, expected, `${nodeId}`);
            }
            newNodes.push({
                nodeId,
                //eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                depth: actual,
            });
        }
    }
    //fs.writeFileSync(`${__dirname}/new-nodes.json`, JSON.stringify({nodes:newNodes}));
    t.end();
});
//# sourceMappingURL=calculate-depths-snapshot.js.map