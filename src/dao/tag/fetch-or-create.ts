import * as sql from "@squill/squill";
import * as table from "../../table";

export async function fetchOrCreate (
    connection : sql.IsolableInsertOneConnection,
    args : {
        readonly title : string,
    }
) {
    return connection.transactionIfNotInOne(async (connection) => {
        const tag = await table.tag
            .whereEqCandidateKey({
                title : args.title,
            })
            .fetchOne(
                connection,
                columns => [columns.tagId]
            )
            .orUndefined();
        if (tag != undefined) {
            return tag;
        }

        const {tagId} = await table.tag.insertAndFetch(
            connection,
            {
                title : args.title,
            }
        );
        return {
            tagId,
        };
    });
}
