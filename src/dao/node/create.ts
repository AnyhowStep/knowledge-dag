import {bigIntLib} from "bigint-lib";
import * as sql from "@squill/squill";
import * as table from "../../table";
import * as tagDao from "../tag";

export async function create (
    connection : sql.IsolableInsertOneConnection,
    args : {
        readonly title : string,
        readonly description : string,
        readonly content : string,

        readonly tags : readonly string[],
    }
) {
    return connection.transactionIfNotInOne(async (connection) => {
        const {nodeId} = await table.node.insertOne(
            connection,
            {
                /**
                 * A node with no dependencies is a root.
                 * So, depth zero makes sense.
                 */
                depth : bigIntLib.BigInt(0),
            }
        );

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

        await table.edit.insertOne(
            connection,
            {
                nodeId,
                title : args.title,
                description : args.description,
                content : args.content,
            }
        );

        return {
            nodeId,
        };
    });
}
