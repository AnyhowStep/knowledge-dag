import * as vis from "vis";
import {ParentDetailed, ChildDetailed} from "../../../api-mapper";

export enum Group {
    Explored = "explored",
    Unexplored = "unexplored",
    ExploredRoot = "explored-root",
    ExploredLeaf = "explored-leaf",
    UnexploredRoot = "unexplored-root",
    UnexploredLeaf = "unexplored-leaf",
}
export interface VisNode extends vis.Node {
    data : {
        nodeId : string,
        title : string,
        description : string,
        depth : bigint,
    },
    //When using the hierarchical layout, the level determines
    //where the node is going to be positioned.
    level : number,
    group : Group,
    //Title to be displayed when the user hovers over the node.
    //The title can be an HTML element or a string containing plain text or HTML.
    title : string|HTMLElement|undefined,
    label : string,
    fixed : {
        x : boolean,
        y : boolean,
    },

    exploredUp? : boolean,
    exploredDown? : boolean,
    isRoot? : boolean,
    isLeaf? : boolean,
}
//There are other properties not listed here
//http://visjs.org/docs/network/edges.html
export interface VisChosenEdge {
    toArrow? : boolean,
    width?   : number,
    color?   : string,
    opacity? : number,
    dashes?  : boolean,
    smooth?  : {
        type : "cubicBezier",
        forceDirection : "vertical"
    },
    hidden? : boolean,
}
export interface VisEdge extends vis.Edge {
    from : string,
    to : string,
    physics : boolean,
    id : string,
    direct : boolean,
    parentData? : ParentDetailed,
    childData?  : ChildDetailed,

    arrows? : string|{}, //TODO, what is the object?
    width? : number,
    color? : string|{
        color   : string,
        opacity : number,
    },
    chosen? : boolean|{
        edge : (chosen : VisChosenEdge, id : string, selected : boolean, hovering : boolean) => void;
    },
}
