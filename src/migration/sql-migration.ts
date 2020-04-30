import * as migrator from "agnostic-migrator";
import * as sql from "@squill/squill";
import * as fs from "fs";

export interface SqlMigrationArgs {
    /**
     * A unique identifier for the migration.
     *
     * If duplicate identifiers are found in a list of migrations, an error is raised.
     */
    readonly identifier : string,
    /**
     * A description associated with the migration.
     */
    readonly description : string,

    readonly upSqlFile : string,
    readonly downSqlFile : string,

    readonly pool : sql.IPool,

    readonly shouldSkipUpMigration? : (connection : sql.IConnection) => Promise<boolean>,
}

export class SqlMigration implements migrator.Migration {
    private readonly upSqlFile : string;
    private readonly downSqlFile : string;
    private readonly pool : sql.IPool;
    private readonly shouldSkipUpMigration : undefined|((connection : sql.IConnection) => Promise<boolean>);

    constructor (args : SqlMigrationArgs) {
        this.identifier = args.identifier;
        this.description = args.description;

        this.upSqlFile = args.upSqlFile;
        this.downSqlFile = args.downSqlFile;
        this.pool = args.pool;
        this.shouldSkipUpMigration = args.shouldSkipUpMigration;
    }
    /**
     * A unique identifier for the migration.
     *
     * If duplicate identifiers are found in a list of migrations, an error is raised.
     */
    readonly identifier : string;
    /**
     * A description associated with the migration.
     */
    readonly description : string;
    /**
     * The function that migrates upwards to a newer version.
     */
    readonly up : migrator.UpMigrateDelegate = async () => {
        if (this.shouldSkipUpMigration != undefined) {
            const shouldSkipUpMigration = this.shouldSkipUpMigration;
            const shouldSkip = await this.pool.acquire((connection) => {
                return shouldSkipUpMigration(connection);
            });
            if (shouldSkip) {
                /**
                 * Don't run the up migration.
                 */
                return;
            }
        }
        return new Promise<void>((resolve, reject) => {
            fs.readFile(this.upSqlFile, (err, data) => {
                if (err != undefined) {
                    reject(err);
                    return;
                }
                const upSql = data.toString("binary");
                this.pool
                    .acquire((connection) => {
                        return connection.rawQuery(upSql);
                    })
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        });
    };
    /**
     * The function that migrates downwards to an older version.
     */
    readonly down : migrator.DownMigrateDelegate = async () => {
        return new Promise<void>((resolve, reject) => {
            fs.readFile(this.downSqlFile, (err, data) => {
                if (err != undefined) {
                    reject(err);
                    return;
                }
                const downSql = data.toString("binary");
                this.pool
                    .acquire((connection) => {
                        return connection.rawQuery(downSql);
                    })
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        });
    };
}

export function sqlMigrationFactory (
    pool : sql.IPool
) : (
    (identifier : string) => SqlMigration
) {
    return (identifier : string) => {
        return new SqlMigration({
            identifier,
            description : identifier,
            upSqlFile : `${__dirname}/../../sql/up-${identifier}.sql`,
            downSqlFile : `${__dirname}/../../sql/down-${identifier}.sql`,
            pool,
        });
    };
}
