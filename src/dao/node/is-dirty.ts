import * as sql from "@squill/squill";
import * as table from "../../table";

export function isDirty () {
    return sql.exists(
        sql.requireOuterQueryJoins(table.node)
            .from(table.dirtyNode)
            .whereEqOuterQueryPrimaryKey(
                tables => tables.dirtyNode,
                tables => tables.node
            )
    );
}
