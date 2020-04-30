import * as tm from "type-mapping/fluent";
import {nodeId} from "./id";
import {createdAt} from "./date-time";

/**
 * A node becomes "dirty" when,
 * + A dependency is added
 * + A dependency is deleted
 * + A dependent is deleted
 *
 * An asynchronous process is then triggered to recalculate the graph
 * for dirty nodes.
 */
export const dirtyNode = tm.fields({
    nodeId,
    createdAt,
});
