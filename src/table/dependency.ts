import * as sql from "@squill/squill";
import * as m from "../mapper";

export const dependency = sql.table("dependency")
    .addColumns(m.dependency)
    .setPrimaryKey(columns => [
        columns.nodeId,
        columns.parentId,
    ])
    .addMutable(columns => [
        columns.direct,
    ]);
