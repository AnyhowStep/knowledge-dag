import * as tm from "type-mapping";

export const {
    nodeId,
    editId,

    tagId,
} = tm.fields({
    nodeId : tm.mysql.bigIntUnsigned(),
    editId : tm.mysql.bigIntUnsigned(),

    tagId : tm.mysql.bigIntUnsigned(),
});
