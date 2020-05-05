import * as sql from "@squill/squill";
import {bigIntLib} from "bigint-lib";
import * as table from "../../table";
import {findPathToAncestor} from "../../dag";

export class NodeParentInsertError extends Error {
    public path : string[];
    constructor (message : string, path : string[]) {
        super(message);
        Object.setPrototypeOf(this, NodeParentInsertError.prototype);

        this.path = path;
    }
}

export async function create (
    connection : sql.ConnectionComponent.TransactionIfNotInOne<
        & sql.IsolatedInsertOneConnection
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

        await table.node
            .whereEqPrimaryKey({nodeId})
            .assertExists(connection);

        await table.node
            .whereEqPrimaryKey({nodeId : parentId})
            .assertExists(connection);

        /**
         * If a path exists from the parent to the node,
         * Then we're trying to insert an edge that will create a cycle
         */
        const pathToAncestor = await findPathToAncestor({
            from : args.parentId.toString(),
            to : args.nodeId.toString(),
            fetchAllParent : (nodeId) => {
                return sql.from(table.dependency)
                    .where(columns =>
                        sql.eq(columns.nodeId, bigIntLib.BigInt(nodeId))
                    )
                    .selectValue(columns => columns.parentId)
                    .fetchValueArray(connection)
                    .then((parentIds) => parentIds.map(parentId => parentId.toString()));
            },
        });
        if (pathToAncestor != undefined) {
            throw new NodeParentInsertError(
                `A path from ${args.parentId} to ${args.nodeId} exists, adding ${args.nodeId}->${args.parentId} would create a cycle`,
                pathToAncestor
            );
        }

        await table.dependency.insertOne(
            connection,
            {
                nodeId,
                parentId,
                /**
                 * Assume direct for now.
                 */
                direct : true,
            }
        );

        await table.dirtyNode.replaceOne(
            connection,
            {
                nodeId
            }
        );
    });
}
