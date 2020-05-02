import * as sql from "@squill/squill";
import * as table from "./table";

export * from "./table";

export async function validateTables (
    connection : sql.IConnection
) : Promise<sql.SchemaValidationResult> {
    const schemaMeta = await connection.tryFetchSchemaMeta(undefined);
    if (schemaMeta == undefined) {
        throw new Error(`Could not fetch schema meta`);
    }
    const result = await sql.SchemaValidationUtil.validateSchema(
        (Object.values(table) as unknown[]).filter<sql.ITable>(sql.TableUtil.isTable),
        schemaMeta
    );
    return result;
}
