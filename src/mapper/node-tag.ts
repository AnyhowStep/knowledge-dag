import * as tm from "type-mapping/fluent";
import {nodeId, tagId} from "./id";

export const nodeTag = tm.fields({
    nodeId,
    tagId,
});
