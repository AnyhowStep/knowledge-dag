import * as sql from "@squill/squill";
import * as m from "../mapper";
import {node} from "./node";

export const edit = sql.table("edit")
    .addColumns(m.edit)
    .setAutoIncrement(columns => columns.editId)
    .addCandidateKey(columns => [
        columns.nodeId,
        columns.createdAt,
    ])
    .addExplicitDefaultValue(columns => [
        columns.createdAt
    ]);

export const editLog = sql.log(edit)
    .setOwner(node)
    /**
     * @todo Primary key alone should be enough to determine latest order
     */
    .setLatestOrder(columns => columns.createdAt.desc())
    .setTracked(columns => [
        columns.title,
        columns.description,
        columns.content,
    ])
    .setDoNotCopy(() => [])
    .setTrackedDefaults({
        title : undefined,
        description : undefined,
        content : undefined,
    });
