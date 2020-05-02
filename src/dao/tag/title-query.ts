import * as sql from "@squill/squill";
import * as table from "../../table";

export function titleQuery () {
    return sql
        .from(table.tag)
        .orderBy(columns => [
            columns.title.desc(),
        ])
        .select(columns => [
            columns.title,
        ])
        .map(row => {
            return row.tag.title;
        });
}
