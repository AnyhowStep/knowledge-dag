import * as tm from "type-mapping/fluent";
import * as m from "../mapper";

export const tagWithCount = tm.object(
    m.tag.tagId,
    m.tag.title,
    tm.mysql.bigIntUnsigned().withName("nodeCount"),
);
export type TagWithCount = ReturnType<typeof tagWithCount>;

export const updateTagBody = tm.object(
    m.edit.title,
);
export type UpdateTagBody = ReturnType<typeof updateTagBody>;
