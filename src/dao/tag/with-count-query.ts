import * as sql from "@squill/squill";
import * as table from "../../table";
import {nodeCount} from "./node-count";

export function withCountQuery () {
    return sql
        .from(table.tag)
        .orderBy(columns => [
            columns.title.asc(),
        ])
        .select((columns) => [
            columns.tagId,
            columns.title,
            nodeCount(),
        ]);
}
