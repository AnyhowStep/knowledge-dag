import * as sql from "@squill/squill";
import * as table from "../../table";
import {fetchTags} from "./fetch-tags";

export function simpleQuery () {
    return sql
        .from(table.node)
        .orderBy(columns => [
            columns.depth.desc(),
            columns.createdAt.desc(),
            columns.nodeId.desc(),
        ])
        .select(columns => [
            columns.nodeId,
            columns.createdAt,
            columns.depth,
        ])
        .map(async (row, connection) => {
            const latestEdit = await sql.LogUtil
                .latestByPrimaryKey(
                    table.editLog,
                    row.node
                )
                .select(columns => [
                    columns.title,
                    columns.description,
                ])
                .fetchOne(connection);

            const tags = await fetchTags(connection, row.node);

            return {
                ...row.node,
                latestEdit,
                tags,
            };
        });
}
