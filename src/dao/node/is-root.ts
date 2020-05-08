import * as sql from "@squill/squill";
import * as table from "../../table";

export function hasParent () {
    return sql.exists(
        sql.requireOuterQueryJoins(table.node)
            .from(table.dependency)
            .whereEqOuterQueryPrimaryKey(
                tables => tables.dependency,
                tables => tables.node
            )
    );
}

export function isRoot () {
    return sql.not(hasParent());
}
