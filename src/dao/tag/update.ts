import * as sql from "@squill/squill";
import * as table from "../../table";

export async function update (
    connection : sql.IsolableUpdateConnection,
    args : {
        readonly tagId : bigint,
        readonly title : string,
    }
) {
    return connection.transactionIfNotInOne(async (connection) => {
        const {tagId} = args;
        await table.tag
            .whereEqPrimaryKey({tagId})
            .assertExists(connection);

        return table.tag
            .whereEqPrimaryKey({tagId})
            .updateOne(
                connection,
                () => {
                    return {
                        title : args.title,
                    };
                }
            );
    });
}
