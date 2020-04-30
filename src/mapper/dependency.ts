import * as tm from "type-mapping/fluent";
import {nodeId} from "./id";

export const dependency = tm.fields({
    nodeId,
    parentId : nodeId,
    /**
     * Will be calculated asynchronously, in the background.
     * A direct dependency is an edge in the transitive reduction of a graph.
     */
    direct : tm.mysql.boolean(),
});
