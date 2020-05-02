import {CalculateRelativeRootDepthsResult} from "./calculate-relative-root-depths";

export function calculateDeltaDepth (
    target : CalculateRelativeRootDepthsResult,
    other  : CalculateRelativeRootDepthsResult
) : undefined|number {

    const commonIds = [...target.relativeDepths.keys()]
        .filter(key => other.relativeDepths.has(key));

    if (commonIds.length == 0) {
        return undefined;
    }
    const id = commonIds[0];
    const targetDepth = target.relativeDepths.get(id);
    const otherDepth  = other.relativeDepths.get(id);
    if (targetDepth == undefined || otherDepth == undefined) {
        //This should not happen
        throw new Error(`Expected target and other depth for id ${id}, received ${targetDepth} and ${otherDepth}`);
    }
    return targetDepth - otherDepth;
}

/**
 * Assumes graph is **connected**
 */
export function tryMergeRelativeRootDepths (
    target : CalculateRelativeRootDepthsResult,
    other  : CalculateRelativeRootDepthsResult
) : boolean {
    const deltaDepth = calculateDeltaDepth(target, other);
    if (deltaDepth == undefined) {
        return false;
    }
    for (const [id, depth] of other.relativeDepths) {
        const mergedDepth = depth + deltaDepth;
        if (mergedDepth > target.highestDepth) {
            target.highestRoot  = id;
            target.highestDepth = mergedDepth;
        }
        target.relativeDepths.set(id, mergedDepth);
    }
    return true;
}
