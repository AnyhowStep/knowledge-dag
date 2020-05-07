import * as sql from "@squill/squill";
import * as table from "../../table";

export function filter (args : {
    nodeId? : bigint,
    parentId? : bigint,
}) {
    return sql.and(
        (
            args.nodeId == undefined ?
            true :
            sql.eq(table.dependency.columns.nodeId, args.nodeId)
        ),
        (
            args.parentId == undefined ?
            true :
            sql.eq(table.dependency.columns.parentId, args.parentId)
        ),
    );
}
