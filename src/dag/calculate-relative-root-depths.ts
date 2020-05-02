import {FetchAllDirectParent} from "./callback";
import {findLongestPathToAccessibleRoots} from "./find-longest-path-to-accessible-roots";

export interface CalculateRelativeRootDepthsArgs {
    id : string,
    fetchAllDirectParent : FetchAllDirectParent,
}

export interface CalculateRelativeRootDepthsResult {
    relativeDepths : Map<string, number>,
    highestRoot    : undefined|string,
    highestDepth   : number,
}

export async function calculateRelativeRootDepths (args : CalculateRelativeRootDepthsArgs) : Promise<CalculateRelativeRootDepthsResult> {
    const paths = await findLongestPathToAccessibleRoots({
        id : args.id,
        fetchAllDirectParent : args.fetchAllDirectParent,
    });
    const relativeDepths = new Map<string, number>();
    let highestRoot  : undefined|string = undefined;
    let highestDepth = 0;
    for (const path of paths) {
        const root  = path[path.length-1]; //This gives us the root
        const depth = path.length;
        relativeDepths.set(root, depth);
        if (depth > highestDepth) {
            highestRoot  = root;
            highestDepth = depth;
        }
    }
    return {
        relativeDepths : relativeDepths,
        highestRoot    : highestRoot,
        highestDepth   : highestDepth,
    };
}
