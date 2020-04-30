import * as sql from "@squill/squill";
import * as table from "../../table";
import * as tagDao from "../tag";

export async function update (
    connection : sql.ConnectionComponent.TransactionIfNotInOne<
        & sql.IsolatedInsertOneConnection
        & sql.IsolatedDeleteConnection
    >,
    args : {
        readonly nodeId : bigint,
        readonly title : string,
        readonly description : string,
        readonly content : string,

        readonly tags : readonly string[],
    }
) {
    return connection.transactionIfNotInOne(async (connection) => {
        const {nodeId} = args;
        await table.node
            .whereEqPrimaryKey({nodeId})
            .assertExists(connection);

        await table.nodeTag
            .where(columns => sql.eq(
                columns.nodeId,
                nodeId
            ))
            .delete(connection);

        for (const title of args.tags) {
            const {tagId} = await tagDao.fetchOrCreate(
                connection,
                {
                    title,
                }
            );
            await table.nodeTag.insertOne(
                connection,
                {
                    nodeId,
                    tagId,
                }
            );
        }

        await table.editLog.unsafeTrack(
            connection,
            {nodeId},
            {
                title : args.title,
                description : args.description,
                content : args.content,
            }
        );
    });
}
