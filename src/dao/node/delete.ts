import * as sql from "@squill/squill";
import * as table from "../../table";

export async function del (
    connection : sql.IsolableDeleteConnection,
    primaryKey : sql.PrimaryKey<typeof table.node>
) {
    return connection.transactionIfNotInOne(async (connection) => {
        await table.node
            .whereEqPrimaryKey(primaryKey)
            .assertExists(connection);

        await table.dirtyNode
            .whereEqPrimaryKey(primaryKey)
            .delete(connection);

        await table.nodeTag
            .where(columns => sql.eq(
                columns.nodeId,
                primaryKey.nodeId
            ))
            .delete(connection);

        await table.edit
            .where(columns => sql.eq(
                columns.nodeId,
                primaryKey.nodeId
            ))
            .delete(connection);

        await table.node
            .whereEqPrimaryKey(primaryKey)
            .deleteOne(connection);
    });
}

export {del as delete};
