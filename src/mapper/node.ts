import * as tm from "type-mapping/fluent";
import {nodeId} from "./id";
import {createdAt} from "./date-time";

export const node = tm.fields({
    nodeId,
    createdAt,
    /**
     * Will be calculated asynchronously, in the background.
     */
    depth : tm.mysql.bigIntUnsigned(),
});
