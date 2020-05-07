import * as sql from "@squill/squill";
import * as table from "../../table";

export function childDetailedQuery () {
    return sql
        .from(table.dependency)
        .innerJoin(
            table.node.as("child"),
            columns => sql.eq(
                columns.dependency.nodeId,
                columns.child.nodeId
            )
        )
        .select(columns => [
            columns.dependency.nodeId,
            columns.dependency.direct,

            columns.child.depth,
        ])
        .map(async (row, connection) => {
            const latestEdit = await sql.LogUtil
                .latestByPrimaryKey(
                    table.editLog,
                    { nodeId : row.dependency.nodeId }
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
                ...row.child,
                latestEdit,
            };
        });
}
