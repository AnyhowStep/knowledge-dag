import * as sql from "@squill/squill";
import * as m from "../mapper";

export const nodeTag = sql.table("nodeTag")
    .addColumns(m.nodeTag)
    .setPrimaryKey(columns => [
        columns.nodeId,
        columns.tagId,
    ]);
