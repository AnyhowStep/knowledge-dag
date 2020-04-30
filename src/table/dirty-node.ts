import * as sql from "@squill/squill";
import * as m from "../mapper";

export const dirtyNode = sql.table("dirtyNode")
    .addColumns(m.dirtyNode)
    .setPrimaryKey(columns => [columns.nodeId])
    .addExplicitDefaultValue(columns => [
        columns.createdAt
    ]);
