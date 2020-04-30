/**
 * Migrates down one file
 */
import * as migrator from "agnostic-migrator";
import {inspect} from "./inspect";
import {migrations, stateStorage} from "./migration-data";

const identifier : string|undefined = process.argv[2];
migrator
    .migrateDown({
        migrations,
        stateStorage,
        identifier,
    })
    .then((result) => {
        console.log(
            "Migrated down",
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
