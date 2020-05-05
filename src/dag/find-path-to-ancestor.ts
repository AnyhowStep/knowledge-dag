import {FetchAllParent} from "./callback";

export interface FindPathToAncestorArgs {
    from : string,
    to : string,
    fetchAllParent : FetchAllParent,
}
interface FindPathToAncestorImplArgs extends FindPathToAncestorArgs {
    path : string[],
    closed : Set<string>,
}

async function findPathToAncestorImpl (args : FindPathToAncestorImplArgs) : Promise<boolean> {
    if (args.from === args.to) {
        args.path.push(args.from);
        return true;
    }
    if (args.closed.has(args.from)) {
        return false;
    }
    args.closed.add(args.from);

    const parents = await args.fetchAllParent(args.from);
    for (const p of parents) {
        if (await findPathToAncestorImpl({
            ...args,
            from : p,
        })) {
            args.path.push(args.from);
            return true;
        }
    }
    return false;
}

export async function findPathToAncestor (args : FindPathToAncestorArgs) : Promise<string[]|undefined> {
    const path : string[] = [];
    const foundPath = await findPathToAncestorImpl({
        ...args,
        path : path,
        closed : new Set<string>(),
    });
    return (foundPath) ?
        path :
        undefined;
}
