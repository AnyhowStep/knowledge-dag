import {FetchAllDirectParent} from "./callback";
import {calculateRelativeRootDepths, CalculateRelativeRootDepthsResult} from "./calculate-relative-root-depths";
import {tryMergeRelativeRootDepths} from "./try-merge-relative-root-depths";

export interface CalculateAllRelativeRootDepthsArgs {
    root : Set<string>,
    leaf : Set<string>,
    fetchAllDirectParent : FetchAllDirectParent,
}
/**
 * Assumes graph is **connected**
 */
export async function calculateAllRelativeRootDepths (args : CalculateAllRelativeRootDepthsArgs) {
    const leafIds = [...args.leaf.keys()];
    if (leafIds.length == 0) {
        throw new Error(`Expected at least one leaf`);
    }
    const result = await calculateRelativeRootDepths({
        id : leafIds[0],
        fetchAllDirectParent : args.fetchAllDirectParent,
    });
    const toMerge : CalculateRelativeRootDepthsResult[] = [];

    for (let i=1; i<leafIds.length; ++i) {
        if (result.relativeDepths.size >= args.root.size) {
            break;
        }
        const cur = await calculateRelativeRootDepths({
            id : leafIds[i],
            fetchAllDirectParent : args.fetchAllDirectParent,
        });
        if (!tryMergeRelativeRootDepths(result, cur)) {
            toMerge.push(cur);
        }
    }
    while (result.relativeDepths.size < args.root.size) {
        const cur = toMerge.shift();
        if (cur == undefined) {
            break;
        }
        if (!tryMergeRelativeRootDepths(result, cur)) {
            toMerge.push(cur);
        }
    }
    if (result.relativeDepths.size < args.root.size) {
        throw new Error(`Could not calculate relative depths for all roots, found ${result.relativeDepths.size}/${args.root.size}`);
    }
    {
        const missingIds = [...args.root.keys()]
            .filter(key => !result.relativeDepths.has(key));
        if (missingIds.length > 0) {
            throw new Error(`Did not calculate relative depths for all roots, missing ${missingIds.join(", ")}`);
        }
    }
    return result;
}
