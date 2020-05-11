import * as sql from "@squill/squill";
import * as table from "../../table";
import {fetchTags} from "../node";

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

            const tags = await fetchTags(connection, { nodeId : row.dependency.parentId });

            return {
                ...row.dependency,
                ...row.parent,
                latestEdit,
                tags,
            };
        });
}
