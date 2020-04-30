import {bigIntLib} from "bigint-lib";
import * as migrator from "agnostic-migrator";
import * as sql from "@squill/squill";
import * as tm from "type-mapping";
import * as fs from "fs";
import * as mysql from "@squill/mysql-5.7";

export const successfulMigrationTable = sql.table("successfulMigration")
    .addColumns({
        identifier  : tm.mysql.varChar(1, 255),
        migratedUp  : tm.mysql.boolean(),
        timestamp   : tm.mysql.double(),
        batchNumber : tm.mysql.double(),
    })
    .setPrimaryKey(columns => [columns.identifier]);

    export const migrationLockTable = sql.table("migrationLock")
    .addColumns({
        lockKey : tm.mysql.varChar(1, 255),
    })
    .setPrimaryKey(columns => [columns.lockKey]);

async function ensureTablesExist (connection : sql.IConnection) {
    const exists = await mysql.TABLES
        .where(columns => sql.and(
            sql.eq(columns.TABLE_SCHEMA, sql.throwIfNull(sql.currentSchema())),
            sql.eq(columns.TABLE_NAME, successfulMigrationTable.alias)
        ))
        .exists(connection);
    if (exists) {
        return;
    }
    await connection.rawQuery(
        fs.readFileSync(`${__dirname}/../../sql/state-storage.sql`).toString("binary")
    );
}

/**
 * An arbitrary value chosen for creating the migration lock
 */
const lockKey = "lockKey";

export class StateStorage implements migrator.StateStorage {
    private readonly pool : sql.IPool;

    constructor (pool : sql.IPool) {
        this.pool = pool;
    }

    private initialized = false;
    private async init () {
        if (this.initialized) {
            return;
        }
        await this.pool.acquire((connection) => {
            return ensureTablesExist(connection);
        });
        this.initialized = true;
    }

    /**
     * Called after a successful `up` migration.
     */
    readonly setSuccessfulMigration = async (successfulMigration : migrator.SuccessfulMigration) : Promise<void> => {
        await this.init();
        await this.pool.acquireTransaction((connection) => {
            return successfulMigrationTable.replaceOne(
                connection,
                successfulMigration
            );
        });
    };
    /**
     * Just needs to fetch all `SuccessfulMigration`s.
     * Does not need to sort it.
     *
     * -----
     *
     * It should be fine to return all successful migrations
     * and should not result in an OOM... In general.
     *
     * If you have enough successful migrations that loading
     * them all in memory will cause an OOM, you should find a more robust solution.
     *
     * -----
     *
     * Alternatively, we can just modify the API to return
     * a paginated list of successful migrations...
     */
    readonly fetchAllSuccessfulMigrations = async () : Promise<readonly migrator.SuccessfulMigration[]> => {
        await this.init();
        return this.pool.acquireTransaction((connection) => {
            return sql.from(successfulMigrationTable)
                .select(columns => [columns])
                .fetchAll(connection);
        });
    };

    /**
     * Tries to create a lock so we do not have multiple migrations happening at the same time.
     *
     * If a lock already exists, it should return `false`.
     * If a lock did not exist, it should create the lock and return `true`.
     *
     * If the migration fails halfway, you will need to,
     * 1. Manually resolve the problem
     * 2. Manually remove the lock
     * 3. Run the migration again
     */
    readonly tryLock = async () : Promise<boolean> => {
        await this.init();
        return this.pool.acquireTransaction(async (connection) => {
            const exists = await migrationLockTable
                .whereEqPrimaryKey({ lockKey })
                .exists(connection);
            if (exists) {
                /**
                 * Could not lock because a migration lock already exists.
                 */
                return false;
            } else {
                /**
                 * Create a migration lock.
                 */
                await migrationLockTable.insertOne(
                    connection,
                    { lockKey }
                );
                return true;
            }
        });
    };
    /**
     * Removes the lock, if any.
     * If there's no lock, it may throw an error or choose to do nothing.
     * Throwing is recommended.
     */
    readonly unlock = async () : Promise<void> => {
        await this.init();
        return this.pool.acquireTransaction(async (connection) => {
            const deleteResult = await migrationLockTable
                .whereEqPrimaryKey({ lockKey })
                .deleteZeroOrOne(connection);
            if (!bigIntLib.equal(deleteResult.deletedRowCount, 1)) {
                throw new Error(`Expected to remove one migration lock, removed ${deleteResult.deletedRowCount}`);
            }
        });
    };
}
