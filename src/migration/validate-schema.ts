import * as sql from "@squill/squill";
import {inspect} from "./inspect";
import {pool} from "./migration-data";
import * as table from "../table";
import {successfulMigrationTable, migrationLockTable} from "./state-storage";

pool.acquire(async (connection) => {
    const schemaMeta = await connection.tryFetchSchemaMeta(undefined);
    if (schemaMeta == undefined) {
        throw new Error(`Could not get schema meta`);
    }
    return sql.SchemaValidationUtil.validateSchema(
        [
            table.node,
            table.tag,
            table.nodeTag,
            table.edit,
            table.dependency,
            table.dirtyNode,

            successfulMigrationTable,
            migrationLockTable,
        ],
        schemaMeta
    );
})
    .then((result) => {
        console.log(
            "Validated schema",
            inspect(result)
        );
        process.exit(result.errors.length > 0 ? 1 : 0);
    })
    .catch((err) => {
        console.error(
            "An error was encountered",
            inspect(err)
        );
        process.exit(1);
    });
