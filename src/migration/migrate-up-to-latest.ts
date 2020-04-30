/**
 * This should get all migration files and migrate up to the latest version
 */
import * as migrator from "agnostic-migrator";
import {inspect} from "./inspect";
import {migrations, stateStorage} from "./migration-data";

migrator
    .migrateUpToLatest({
        migrations,
        stateStorage,
    })
    .then((result) => {
        console.log(
            "Migrated up to latest",
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
