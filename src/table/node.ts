import * as sql from "@squill/squill";
import * as m from "../mapper";

export const node = sql.table("node")
    .addColumns(m.node)
    .setAutoIncrement(columns => columns.nodeId)
    .addExplicitDefaultValue(columns => [
        columns.createdAt
    ])
    .addMutable(columns => [
        columns.depth,
    ]);
