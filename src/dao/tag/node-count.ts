import * as sql from "@squill/squill";
import * as table from "../../table";

export function nodeCount () {
    return sql.requireOuterQueryJoins(table.tag)
        .from(table.nodeTag)
        .whereEqOuterQueryPrimaryKey(
            tables => tables.nodeTag,
            tables => tables.tag
        )
        .selectValue(() => sql.countAll())
        .as("nodeCount");
}
