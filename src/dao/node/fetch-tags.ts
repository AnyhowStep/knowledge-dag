import * as sql from "@squill/squill";
import * as table from "../../table";

export function fetchTags (
    connection : sql.SelectConnection,
    node : sql.PrimaryKey<typeof table.node>
) {
    return sql.from(table.nodeTag)
        .whereEq(
            columns => columns.nodeId,
            node.nodeId
        )
        .innerJoinUsingPrimaryKey(
            tables => tables.nodeTag,
            table.tag
        )
        .orderBy(columns => [
            columns.tag.title.asc()
        ])
        .selectValue(columns => columns.tag.title)
        .fetchValueArray(connection);

}
