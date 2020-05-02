import {FetchAllParent, FetchAllChild, SetDirectParent} from "./callback";
import {findDirectParents} from "./find-direct-parents";

export interface CalculateDirectParentsArgs {
    id : string,
    fetchAllParent  : FetchAllParent,
    fetchAllChild   : FetchAllChild,
    setDirectParent : SetDirectParent,
}
export interface CalculateDirectParentsImplArgs extends CalculateDirectParentsArgs {
    closed : Set<string>,
    root   : Set<string>,
    leaf   : Set<string>,
}
export interface CalculateDirectParentsResult {
    node : Set<string>,
    root : Set<string>,
    leaf : Set<string>,
}

export async function calculateDirectParentsImpl (args : CalculateDirectParentsImplArgs) {
    if (args.closed.has(args.id)) {
        return;
    }
    args.closed.add(args.id);

    //Find and set direct and indirect parents
    const {direct, indirect} = await findDirectParents({
        id : args.id,
        fetchAllParent : args.fetchAllParent,
    });
    for (const p of direct) {
        await args.setDirectParent(args.id, p, true);
    }
    for (const p of indirect) {
        await args.setDirectParent(args.id, p, false);
    }

    //Move on to the next node
    {
        const parents = await args.fetchAllParent(args.id);
        if (parents.length == 0) {
            //A root node has no parents
            args.root.add(args.id);
        }
        for (const p of parents) {
            if (args.closed.has(p)) {
                continue;
            }
            await calculateDirectParentsImpl({
                ...args,
                id : p,
            });
        }
    }
    {
        const children = await args.fetchAllChild(args.id);
        if (children.length == 0) {
            //A leaf node has no children
            args.leaf.add(args.id);
        }
        for (const c of children) {
            if (args.closed.has(c)) {
                continue;
            }
            await calculateDirectParentsImpl({
                ...args,
                id : c,
            });
        }
    }
}
export async function calculateDirectParents (args : CalculateDirectParentsArgs) : Promise<CalculateDirectParentsResult> {
    const closed = new Set<string>();
    const root   = new Set<string>();
    const leaf   = new Set<string>();

    await calculateDirectParentsImpl({
        ...args,
        closed : closed,
        root   : root,
        leaf   : leaf,
    });

    return {
        //All nodes of the graph have been closed
        //Therefore, the set of all nodes is the set of all closed nodes
        node : closed,
        root : root,
        leaf : leaf,
    };
}
