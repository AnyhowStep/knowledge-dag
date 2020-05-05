import * as tm from "type-mapping/fluent";
import * as m from "../mapper";

export const nodeDetailed = tm.object(
    m.node.nodeId,
    m.node.createdAt,

    tm.object(
        m.edit.title,
        m.edit.description,
        m.edit.content,
        m.edit.createdAt,
    ).withName("latestEdit"),

    tm.array(m.tag.title).withName("tags"),

    tm.array(tm.object(
        m.dependency.parentId,
        m.dependency.direct,

        m.edit.title,
        m.edit.description,

        m.node.depth,
    )).withName("dependencies"),

    tm.array(tm.object(
        m.dependency.nodeId,
        m.dependency.direct,

        m.edit.title,
        m.edit.description,

        m.node.depth,
    )).withName("dependents"),
);
export type NodeDetailed = ReturnType<typeof nodeDetailed>;

export const nodeSimple = tm.object(
    m.node.nodeId,
    m.node.createdAt,
    m.node.depth,

    tm.object(
        m.edit.title,
        m.edit.description,
    ).withName("latestEdit"),

    tm.array(m.tag.title).withName("tags"),
);
export type NodeSimple = ReturnType<typeof nodeSimple>;

export const createNodeBody = tm.object(
    m.edit.title,
    m.edit.description,
    m.edit.content,

    tm.readOnlyArray(m.tag.title).withName("tags"),
);
export type CreateNodeBody = ReturnType<typeof createNodeBody>;

export const updateNodeBody = tm.object(
    m.edit.title,
    m.edit.description,
    m.edit.content,

    tm.readOnlyArray(m.tag.title).withName("tags"),
);
export type UpdateNodeBody = ReturnType<typeof updateNodeBody>;
