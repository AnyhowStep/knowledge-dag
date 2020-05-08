import {VisNode, VisEdge} from "./model";
import {DataSetWrapper} from "./data-set-wrapper";
import {explore} from "./explore";

export async function exploreRecursive (
    {
        nodeId,
        count,
        up,
        down,
        closed,
        nodes,
        edges,
        onInconsistencyDetected,
        firstAddedNode,
    } :
    {
        nodeId : string,
        count : number,
        up : boolean,
        down : boolean,
        closed? : Set<string>,
        nodes : DataSetWrapper<VisNode>,
        edges : DataSetWrapper<VisEdge>,
        onInconsistencyDetected : () => void,
        firstAddedNode : { current : undefined|VisNode },
    }
) {
    if (closed == undefined) {
        closed = new Set<string>();
    }
    if (count <= 0) {
        return;
    }
    if (closed.has(nodeId)) {
        return;
    }
    closed.add(nodeId);
    const node = nodes.get(nodeId);
    if (node == undefined) {
        return;
    }
    await explore({
        nodeId,
        up,
        down,
        nodes,
        edges,
        onInconsistencyDetected,
        firstAddedNode,
    });
    if (count <= 1) {
        return; //Early exit, it'll exit after another iteration anyway
    }
    if (up) {
        const parents = edges.get().filter((edge) => {
            return edge.to == nodeId;
        });
        for (const p of parents) {
            await exploreRecursive({
                nodeId : p.from,
                count : count-1,
                up,
                down,
                closed,
                nodes,
                edges,
                onInconsistencyDetected,
                firstAddedNode,
            });
        }
    }
    if (down) {
        const children = edges.get().filter((edge) => {
            return edge.from == nodeId;
        });
        for (const c of children) {
            await exploreRecursive({
                nodeId : c.to,
                count : count-1,
                up,
                down,
                closed,
                nodes,
                edges,
                onInconsistencyDetected,
                firstAddedNode,
            });
        }
    }
}
