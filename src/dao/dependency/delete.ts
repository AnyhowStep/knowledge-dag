import * as sql from "@squill/squill";
import * as table from "../../table";

export async function del (
    connection : sql.ConnectionComponent.TransactionIfNotInOne<
        & sql.IsolatedDeleteConnection
        & sql.ReplaceOneConnection
    >,
    args : {
        readonly nodeId : bigint,
        readonly parentId : bigint,
    }
) {
    /**
     * @todo recalculate graph
     */
    return connection.transactionIfNotInOne(async (connection) => {
        const {nodeId, parentId} = args;

        await table.dependency
            .whereEqPrimaryKey({nodeId, parentId})
            .deleteOne(connection);

        await table.dirtyNode.replaceOne(
            connection,
            {
                nodeId
            }
        );
        await table.dirtyNode.replaceOne(
            connection,
            {
                nodeId : parentId,
            }
        );
    });
}

export {del as delete};
