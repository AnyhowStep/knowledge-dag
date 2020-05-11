import * as tm from "type-mapping/fluent";
import * as m from "../mapper";

export const parentDetailed = tm.object(
    m.dependency.parentId,
    m.dependency.direct,

    m.node.depth,

    tm.object(
        m.edit.title,
        m.edit.description,
    ).withName("latestEdit"),

    tm.array(m.tag.title).withName("tags"),
);
export type ParentDetailed = ReturnType<typeof parentDetailed>;

export const childDetailed = tm.object(
    m.dependency.nodeId,
    m.dependency.direct,

    m.node.depth,

    tm.object(
        m.edit.title,
        m.edit.description,
    ).withName("latestEdit"),

    tm.array(m.tag.title).withName("tags"),
);
export type ChildDetailed = ReturnType<typeof childDetailed>;
