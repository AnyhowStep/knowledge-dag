import * as sql from "@squill/squill";
import * as table from "../../table";

export function detailedQuery () {
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
                    columns.content,
                    columns.createdAt,
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

            const dependencies = await sql.from(table.dependency)
                .whereEq(
                    columns => columns.nodeId,
                    row.node.nodeId
                )
                .innerJoin(
                    table.node.as("parent"),
                    columns => sql.eq(
                        columns.parent.nodeId,
                        columns.dependency.parentId
                    )
                )
                .orderBy(columns => [
                    columns.parent.depth.desc(),
                ])
                .select(columns => [
                    columns.dependency.parentId,
                    columns.dependency.direct,

                    columns.parent.depth,
                ])
                .map(async (row, connection) => {
                    return {
                        ...row.dependency,
                        ...row.parent,
                        ...(
                            await sql.LogUtil
                                .latestByPrimaryKey(
                                    table.editLog,
                                    {
                                        nodeId : row.dependency.parentId,
                                    }
                                )
                                .select(columns => [
                                    columns.title,
                                    columns.description,
                                ])
                                .fetchOne(connection)
                        ),
                    };
                })
                .fetchAll(connection);

            const dependents = await sql.from(table.dependency)
                .whereEq(
                    columns => columns.parentId,
                    row.node.nodeId
                )
                .innerJoin(
                    table.node.as("child"),
                    columns => sql.eq(
                        columns.child.nodeId,
                        columns.dependency.nodeId
                    )
                )
                .orderBy(columns => [
                    columns.child.depth.asc(),
                ])
                .select(columns => [
                    columns.dependency.nodeId,
                    columns.dependency.direct,

                    columns.child.depth,
                ])
                .map(async (row, connection) => {
                    return {
                        ...row.dependency,
                        ...row.child,
                        ...(
                            await sql.LogUtil
                                .latestByPrimaryKey(
                                    table.editLog,
                                    {
                                        nodeId : row.dependency.nodeId,
                                    }
                                )
                                .select(columns => [
                                    columns.title,
                                    columns.description,
                                ])
                                .fetchOne(connection)
                        ),
                    };
                })
                .fetchAll(connection);

            return {
                ...row.node,
                latestEdit,
                tags,
                dependencies,
                dependents,
            };
        });
}
