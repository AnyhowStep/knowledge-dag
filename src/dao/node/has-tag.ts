import * as sql from "@squill/squill";
import * as table from "../../table";

export function hasTag () {
    return sql.exists(
        sql.requireOuterQueryJoins(table.node)
            .from(table.nodeTag)
            .whereEqOuterQueryPrimaryKey(
                tables => tables.nodeTag,
                tables => tables.node
            )
    );
}
