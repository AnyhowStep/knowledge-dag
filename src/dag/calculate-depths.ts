import {calculateAllRelativeRootDepths} from "./calculate-all-relative-root-depths";
import {FetchAllDirectParent, FetchAllDirectChild} from "./callback";

export interface CalculateDepthsArgs {
    root : Set<string>,
    leaf : Set<string>,
    fetchAllDirectParent : FetchAllDirectParent,
    fetchAllDirectChild  : FetchAllDirectChild,
}
export interface CalculateDepthsImplArgs {
    id : string,
    depth : number,
    depths : Map<string, number>,
    fetchAllDirectChild  : FetchAllDirectChild,
}
export async function calculateDepthsImpl (args : CalculateDepthsImplArgs) {
    {
        const prvDepth = args.depths.get(args.id);
        if (prvDepth != undefined && prvDepth >= args.depth) {
            return;
        }
    }
    args.depths.set(args.id, args.depth);

    const children = await args.fetchAllDirectChild(args.id);
    for (const c of children) {
        await calculateDepthsImpl({
            ...args,
            id : c,
            depth : args.depth+1,
        });
    }
}
/**
 * Assumes graph is **connected**
 */
export async function calculateDepths (args : CalculateDepthsArgs) {
    const roots = await calculateAllRelativeRootDepths({
        root : args.root,
        leaf : args.leaf,
        fetchAllDirectParent : args.fetchAllDirectParent,
    });

    const depths = new Map<string, number>();
    for (const [root, depth] of roots.relativeDepths) {
        const realDepth = roots.highestDepth - depth;
        await calculateDepthsImpl({
            id : root,
            depth : realDepth,
            depths : depths,
            fetchAllDirectChild : args.fetchAllDirectChild,
        });
    }

    return depths;
}
