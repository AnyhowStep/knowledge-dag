import * as sql from "@squill/squill";
import * as m from "../mapper";

export const tag = sql.table("tag")
    .addColumns(m.tag)
    .setAutoIncrement(columns => columns.tagId)
    .addCandidateKey(columns => [
        columns.title
    ])
    .addExplicitDefaultValue(columns => [
        columns.createdAt
    ])
    .addMutable(columns => [
        columns.title,
    ]);
