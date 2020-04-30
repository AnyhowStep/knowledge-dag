import * as tm from "type-mapping/fluent";
import {tagId} from "./id";
import {createdAt} from "./date-time";

export const tag = tm.fields({
    tagId,
    title : tm.mysql.varChar(3, 255),
    createdAt,
});
