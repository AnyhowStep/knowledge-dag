import * as sql from "@squill/squill";
import * as table from "../../table";
import {nodeCount} from "./node-count";
import {bigIntLib} from "bigint-lib";

export async function del (
    connection : sql.IsolableDeleteConnection,
    primaryKey : sql.PrimaryKey<typeof table.tag>
) {
    return connection.transactionIfNotInOne(async (connection) => {
        const count = await table.tag
            .whereEqPrimaryKey(primaryKey)
            .fetchValue(connection, () => nodeCount());

        if (bigIntLib.greaterThan(count, 0)) {
            throw new Error(`Cannot delete tag used by ${count} nodes`);
        }

        await table.tag
            .whereEqPrimaryKey(primaryKey)
            .deleteOne(connection);
    });
}

export {del as delete};
