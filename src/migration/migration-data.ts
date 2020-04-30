import {TypedEnv} from "@anyhowstep/typed-env";
import * as sql from "@squill/squill";
import * as mysql from "@squill/mysql-5.7";
import {buildMigrations} from "./build-migrations";
import {StateStorage} from "./state-storage";

if (process.env.ENV != undefined) {
    TypedEnv.Load(process.env.ENV);
}

/**
 * A different user is required for running migrations.
 *
 * If the **migrator** and **server** both use the **same** MySQL user,
 * it will be dangerous in production environments.
 *
 * You might want a **migrator** user to `CREATE/DROP` tables/FKs/indexes/etc.
 * You **do not** want a **server** user to do the same.
 */
export const pool : sql.IPool = new mysql.Pool({
    host     : TypedEnv.GetStringOrError("MYSQL_HOST"),
    database : TypedEnv.GetStringOrError("MYSQL_DATABASE"),
    user     : TypedEnv.GetStringOrError("MIGRATOR_MYSQL_USERNAME"),
    password : TypedEnv.GetStringOrError("MIGRATOR_MYSQL_PASSWORD"),
    port     : TypedEnv.TryGetNumber("MYSQL_PORT"),
    charset  : mysql.CharSet.utf8mb4,
    /**
     * This lets us execute `.sql` migration files that may contain multiple DDL statements.
     */
    multipleStatements : true,
});

export const migrations = buildMigrations(pool);
export const stateStorage = new StateStorage(pool);
