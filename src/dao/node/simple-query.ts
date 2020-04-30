import * as sql from "@squill/squill";
import * as table from "../../table";

export function simpleQuery () {
    return sql
        .from(table.node)
        .select(columns => [
            columns.nodeId,
            columns.createdAt,
            columns.depth,
        ])
        .map(async (row, connection) => {
            const latestVersion = await sql.LogUtil
                .latestByPrimaryKey(
                    table.editLog,
                    row.node
                )
                .select(columns => [
                    columns.title,
                    columns.description,
                ])
                .fetchOne(connection);

            const tags = await sql.from(table.nodeTag)
                .whereEq(
                    columns => columns.nodeId,
                    row.node.nodeId
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

            return {
                ...row.node,
                latestVersion,
                tags,
            };
        });
}
