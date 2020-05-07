import {bigIntLib} from "bigint-lib";
import {DataSetWrapper} from "./data-set-wrapper";
import {VisNode, VisEdge, Group} from "./model";
import {api} from "../../api";
import {addParent, addChild} from "./add-or-update-edge";

function setNodeGroup (node : VisNode, group : Group, nodes : DataSetWrapper<VisNode>) {
    if (node.group == group) {
        return;
    }
    node.group = group;
    nodes.update(node);
}

export async function explore (
    {
        nodeId,
        up,
        down,
        nodes,
        edges,
        onInconsistencyDetected,
        firstAddedNode,
    } :
    {
        nodeId : string,
        up : boolean
        down : boolean,
        nodes : DataSetWrapper<VisNode>,
        edges : DataSetWrapper<VisEdge>,
        onInconsistencyDetected : () => void,
        firstAddedNode : { current : undefined|VisNode },
    }
) {
    const node = nodes.get(nodeId);
    if (node == undefined) {
        return;
    }
    if (node.exploredUp == true && node.exploredDown == true) {
        //Already explored
        return;
    }
    if (up && node.exploredUp != true) {
        await api.dependency.paginateParentDetailed()
            .setQuery({
                nodeId : bigIntLib.BigInt(nodeId),
                page : bigIntLib.BigInt(0),
                rowsPerPage : bigIntLib.BigInt(100),
            })
            .send()
            .then((result) => {
                node.isRoot = (result.responseBody.rows.length == 0);
                node.exploredUp = true;
                nodes.update(node);

                for (const parent of result.responseBody.rows) {
                    addParent({
                        nodeId,
                        parent,
                        nodes,
                        edges,
                        onInconsistencyDetected,
                        firstAddedNode,
                    });
                }
            });
    }
    if (down && node.exploredDown != true) {
        await api.dependency.paginateChildDetailed()
            .setQuery({
                parentId : bigIntLib.BigInt(nodeId),
                page : bigIntLib.BigInt(0),
                rowsPerPage : bigIntLib.BigInt(100),
            })
            .send()
            .then((result) => {
                node.isLeaf = (result.responseBody.rows.length == 0);
                node.exploredDown = true;
                nodes.update(node);

                for (const child of result.responseBody.rows) {
                    addChild({
                        nodeId,
                        child,
                        nodes,
                        edges,
                        onInconsistencyDetected,
                        firstAddedNode,
                    });
                }
            });
    }

    if (node.exploredUp == true && node.exploredDown == true) {
        if (node.isRoot == true) {
            setNodeGroup(node, Group.ExploredRoot, nodes);
        } else if (node.isLeaf == true) {
            setNodeGroup(node, Group.ExploredLeaf, nodes);
        } else {
            setNodeGroup(node, Group.Explored, nodes);
        }
    } else {
        if (node.isRoot == true) {
            setNodeGroup(node, Group.UnexploredRoot, nodes);
        } else if (node.isLeaf == true) {
            setNodeGroup(node, Group.UnexploredLeaf, nodes);
        } else {
            setNodeGroup(node, Group.Unexplored, nodes);
        }
    }
}
