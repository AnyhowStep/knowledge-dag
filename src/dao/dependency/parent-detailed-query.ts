import * as sql from "@squill/squill";
import * as table from "../../table";

export function parentDetailedQuery () {
    return sql
        .from(table.dependency)
        .innerJoin(
            table.node.as("parent"),
            columns => sql.eq(
                columns.dependency.parentId,
                columns.parent.nodeId
            )
        )
        .select(columns => [
            columns.dependency.parentId,
            columns.dependency.direct,

            columns.parent.depth,
        ])
        .map(async (row, connection) => {
            const latestEdit = await sql.LogUtil
                .latestByPrimaryKey(
                    table.editLog,
                    { nodeId : row.dependency.parentId }
                )
                .select(columns => [
                    columns.title,
                    columns.description,
                    columns.content,
                    columns.createdAt,
                ])
                .fetchOne(connection);

            return {
                ...row.dependency,
                ...row.parent,
                latestEdit,
            };
        });
}
