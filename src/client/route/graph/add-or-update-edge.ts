import {bigIntLib} from "bigint-lib";
import {VisEdge, VisChosenEdge, VisNode, Group} from "./model";
import {DataSetWrapper} from "./data-set-wrapper";
import {ParentDetailed, ChildDetailed} from "../../../../dist/api-mapper";

function setEdgeGroup (edge : VisEdge) {
    if (edge.direct) {
        delete edge.arrows;
        delete edge.width;
        delete edge.color;
        delete edge.chosen;
    } else {
        edge.arrows = "";
        edge.width  = 0;
        edge.color  = {
            color   : "#000000",
            opacity : 0,
        };
        edge.chosen = {
            edge : (chosen : VisChosenEdge, _id : string, selected : boolean, _hovering : boolean) => {
                const indirectEdgeHighlight : Partial<VisChosenEdge> = {
                    toArrow: true,
                    width: 1,
                    color: "#e6fdff",
                    opacity: 1,
                    dashes: true,
                    smooth: {
                        type: "cubicBezier",
                        forceDirection: "vertical"
                    },
                    hidden: false,
                };
                if (selected) {
                    const keys : (keyof VisChosenEdge)[] = Object.keys(indirectEdgeHighlight) as any;
                    for (const key of keys) {
                        if (indirectEdgeHighlight.hasOwnProperty(key)) {
                            chosen[key] = indirectEdgeHighlight[key] as any;
                        }
                    }
                }
            },
        };
    }
}

function isEqualEdgeData (a : { depth : bigint, direct : boolean }, b : { depth : bigint, direct : boolean }) {
    return (
        bigIntLib.equal(a.depth, b.depth) &&
        a.direct == b.direct
    );
}
function isMatchingEdgeData (parent : { depth : bigint, direct : boolean }, child : { depth : bigint, direct : boolean }) {
    return (
        parent.direct == child.direct &&
        bigIntLib.lessThan(parent.depth, child.depth)
    );
}
export function addOrUpdateEdge (
    {
        edge,
        edges,
        onInconsistencyDetected,
    } :
    {
        edge : VisEdge,
        edges : DataSetWrapper<VisEdge>,
        onInconsistencyDetected : () => void,
    }
) {
    const existing = edges.get(edge.id);
    if (existing == undefined) {
        setEdgeGroup(edge);
        edges.add(edge);
    } else {
        //Check existing and edge for consistency
        if (existing.parentData != undefined && edge.parentData != undefined) {
            if (!isEqualEdgeData(existing.parentData, edge.parentData)) {
                onInconsistencyDetected();
                return;
            }
        }
        if (existing.childData != undefined && edge.childData != undefined) {
            if (!isEqualEdgeData(existing.childData, edge.childData)) {
                onInconsistencyDetected();
                return;
            }
        }
        if (existing.parentData != undefined && edge.childData != undefined) {
            if (!isMatchingEdgeData(existing.parentData, edge.childData)) {
                onInconsistencyDetected();
                return;
            }
        }
        if (existing.childData != undefined && edge.parentData != undefined) {
            if (!isMatchingEdgeData(edge.parentData, existing.childData)) {
                onInconsistencyDetected();
                return;
            }
        }

        if (edge.parentData != undefined) {
            existing.parentData = edge.parentData;
        }
        if (edge.childData != undefined) {
            existing.childData = edge.childData;
        }
        existing.physics = edge.physics;

        setEdgeGroup(existing);
        edges.update(existing);
    }
}

function offsetDepth (depth : bigint, firstAddedNode : { current : undefined|VisNode }) : number {
    if (firstAddedNode.current == undefined) {
        return 0;
    }
    return Number(depth) - Number(firstAddedNode.current.data.depth);
}

export function addNode (
    {
        node,
        group,
        nodes,
        firstAddedNode,
    } :
    {
        node : {
            nodeId : string,
            title : string,
            description : string,
            depth : bigint,
        },
        group? : Group.UnexploredRoot|Group.Explored|Group.Unexplored,
        nodes : DataSetWrapper<VisNode>,
        firstAddedNode : { current : undefined|VisNode },
    }
) : boolean {
    if (group == undefined) {
        group = Group.Unexplored;
    }
    const existing : VisNode|undefined = nodes.get(node.nodeId);
    if (existing != undefined) {
        return false;
    }

    let title = (node.title == undefined) ? "<Untitled>" : node.title;
    {
        const titleParts = title.split(" ");
        const lines : string[] = [];
        let   line  : string[] = [];
        let   lineLength = 0;
        for (const part of titleParts) {
            //20 is arbitrary
            if (lineLength + part.length < 20) {
                lineLength += part.length + 1;
                line.push(part);
            } else {
                lines.push(line.join(" "));
                line = [part];
                lineLength = part.length + 1;
            }
        }
        lines.push(line.join(" "));
        title = lines.join("\n");
    }

    const depth = offsetDepth(node.depth, firstAddedNode);
    const newNode : VisNode = {
        group : group,
        id : node.nodeId,
        title : (node.description.length == 0) ? undefined : node.description,
        label : title,
        data : node,
        level : depth,
        y : depth*150,
        fixed : {
            x : false,
            y : true,
        },
    };
    nodes.add(newNode);
    if (firstAddedNode.current == undefined) {
        firstAddedNode.current = newNode;
    }
    return true;
}

export function addParent (
    {
        nodeId,
        parent,
        nodes,
        edges,
        onInconsistencyDetected,
        firstAddedNode,
    } :
    {
        nodeId : string,
        parent : ParentDetailed,
        nodes : DataSetWrapper<VisNode>,
        edges : DataSetWrapper<VisEdge>,
        onInconsistencyDetected : () => void,
        firstAddedNode : { current : undefined|VisNode },
    }
) {
    const node = nodes.get(nodeId);
    if (node == undefined || bigIntLib.lessThanOrEqual(node.data.depth, parent.depth)) {
        onInconsistencyDetected();
        return;
    }
    const edgeId = `${parent.parentId}-${nodeId}`;
    const fromId = parent.parentId;
    const edge : VisEdge = {
        from : fromId.toString(),
        to   : nodeId.toString(),
        id   : edgeId,
        physics : parent.direct,
        direct : parent.direct,
        parentData : parent,
    };
    addNode({
        node : {
            nodeId : parent.parentId.toString(),
            depth : parent.depth,
            title : parent.latestEdit.title,
            description : parent.latestEdit.description,
        },
        nodes,
        firstAddedNode,
    });
    addOrUpdateEdge({
        edge,
        edges,
        onInconsistencyDetected,
    });
}
export function addChild (
    {
        nodeId,
        child,
        nodes,
        edges,
        onInconsistencyDetected,
        firstAddedNode,
    } :
    {
        nodeId : string,
        child : ChildDetailed,
        nodes : DataSetWrapper<VisNode>,
        edges : DataSetWrapper<VisEdge>,
        onInconsistencyDetected : () => void,
        firstAddedNode : { current : undefined|VisNode },
    }
) {
    const node = nodes.get(nodeId);
    if (node == undefined || bigIntLib.greaterThanOrEqual(node.data.depth, child.depth)) {
        onInconsistencyDetected();
        return;
    }
    const edgeId = `${nodeId}-${child.nodeId}`;
    const toId = child.nodeId;
    const edge : VisEdge = {
        from : nodeId,
        to   : toId.toString(),
        id   : edgeId,
        physics : child.direct,
        direct : child.direct,
        childData : child,
    };
    addNode({
        node : {
            nodeId : child.nodeId.toString(),
            depth : child.depth,
            title : child.latestEdit.title,
            description : child.latestEdit.description,
        },
        nodes,
        firstAddedNode,
    });
    addOrUpdateEdge({
        edge,
        edges,
        onInconsistencyDetected,
    });
}
