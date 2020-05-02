import {FetchAllParent} from "./callback";

export interface FindDirectParentsArgs {
    id : string,
    fetchAllParent : FetchAllParent,
}
export interface FindDirectParentsImplArgs {
    parent : string,
    fetchAllParent : FetchAllParent,
    closed   : Set<string>,
    direct   : Set<string>,
    indirect : Set<string>,
}
export interface FindDirectParentsResult {
    direct   : Set<string>,
    indirect : Set<string>,
}
export async function findDirectParentsImpl (args : FindDirectParentsImplArgs) {
    if (args.closed.has(args.parent)) {
        return;
    }
    args.closed.add(args.parent);

    const grandparents = await args.fetchAllParent(args.parent);
    for (const gp of grandparents) {
        //If we thought the grandparent was a direct parent,
        //We were wrong, it's an indirect parent
        if (args.direct.has(gp)) {
            args.direct.delete(gp);
            args.indirect.add(gp);
        }
        if (args.closed.has(gp)) {
            continue;
        }
        await findDirectParentsImpl({
            ...args,
            parent : gp,
        });
    }
}
export async function findDirectParents (args : FindDirectParentsArgs) : Promise<FindDirectParentsResult> {
    const direct   = new Set<string>();
    const indirect = new Set<string>();
    const closed   = new Set<string>();

    const parents = await args.fetchAllParent(args.id);
    //Assume all parents are direct parents at the start
    for (const p of parents) {
        direct.add(p);
    }
    for (const p of parents) {
        //Traverse upwards, to find grandparents
        await findDirectParentsImpl({
            parent   : p,
            fetchAllParent : args.fetchAllParent,
            direct   : direct,
            indirect : indirect,
            closed   : closed,
        });
    }
    return {
        direct : direct,
        indirect : indirect,
    };
}
