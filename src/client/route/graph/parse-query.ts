import {QueryUtil} from "../../ui";

export interface GraphQuery {
    start? : number[],
    selectedNodeId? : number,
    viewSelected? : true,
    random? : true,
}

export interface RawGraphQuery {
    start? : undefined|string|(string[]);
    selectedNodeId? : undefined|string|(string[]);
    viewSelected? : undefined|string|(string[]);
    random? : undefined|string|(string[]);
}

export function parseQuery (search : string) : GraphQuery & { start : number[] } {
    const startArr : number[] = [];
    const result : GraphQuery = {
    };
    const queryObject : RawGraphQuery = QueryUtil.toObject(search);

    {
        const start : undefined|string|(string[]) = queryObject.start;
        if (typeof start == "string") {
            startArr.push(parseInt(start, 10));
        } else if (start instanceof Array) {
            startArr.push(...start.map(nodeId => parseInt(nodeId, 10)));
        }
    }
    {
        const selectedNodeId : undefined|string|(string[]) = queryObject.selectedNodeId;
        if (typeof selectedNodeId == "string") {
            const id = parseInt(selectedNodeId, 10);
            if (isFinite(id)) {
                result.selectedNodeId = id;
            }
        } else if (selectedNodeId instanceof Array) {
            const selectable = selectedNodeId.map(parseInt).filter(isFinite);
            if (selectable.length > 0) {
                result.selectedNodeId = selectable[0];
            }
        }
    }
    if (result.selectedNodeId != undefined) {
        const viewSelected : undefined|string|(string[]) = queryObject.viewSelected;
        if (viewSelected === "true") {
            result.viewSelected = true;
        }
    }
    {
        const random : undefined|string|(string[]) = queryObject["random"];
        if (random === "true") {
            result.random = true;
        }
    }

    return {
        ...result,
        start : [...new Set(startArr.filter(isFinite))],
    };
}
