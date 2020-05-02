import {FetchAllDirectParent} from "./callback";

export interface FindLongestPathToAccessibleRootsArgs {
    id : string,
    fetchAllDirectParent : FetchAllDirectParent,
}
export interface Node {
    prv   : undefined|string,
    depth : number,
}
export interface FindLongestPathToAccessibleRootsImplArgs {
    prv : undefined|string,
    id : string,
    depth : number,
    closed : Map<string, Node>,
    //TODO test by passing in fetchAllParent() instead
    //I have a feeling it'll still work fine
    fetchAllDirectParent : FetchAllDirectParent,
    root : Set<string>,
}

async function findLongestPathToAccessibleRootsImpl (args : FindLongestPathToAccessibleRootsImplArgs) {
    {
        const existing = args.closed.get(args.id);
        if (existing != undefined) {
            if (existing.depth >= args.depth) {
                return;
            }
        }
    }
    args.closed.set(args.id, {
        prv : args.prv,
        depth : args.depth,
    });

    const parents = await args.fetchAllDirectParent(args.id);
    if (parents.length == 0) {
        args.root.add(args.id);
        return;
    }
    for (const p of parents) {
        await findLongestPathToAccessibleRootsImpl({
            ...args,
            prv : args.id,
            id  : p,
            depth : args.depth+1,
        });
    }
}

export async function findLongestPathToAccessibleRoots (args : FindLongestPathToAccessibleRootsArgs) {
    const closed = new Map<string, Node>();
    const root   = new Set<string>();
    await findLongestPathToAccessibleRootsImpl({
        prv : undefined,
        id : args.id,
        depth : 0,
        closed : closed,
        fetchAllDirectParent : args.fetchAllDirectParent,
        root : root,
    });

    const result : string[][] = [];
    for (const r of root) {
        const path : string[] = [];
        let   cur : string|undefined = r;
        while (cur != undefined) {
            path.unshift(cur);
            const node = closed.get(cur);
            if (node == undefined) {
                //cur = undefined;
                throw new Error(`Expected a node for id ${cur}`);
            } else {
                cur = node.prv;
            }
        }
        result.push(path);
    }
    return result;
}
