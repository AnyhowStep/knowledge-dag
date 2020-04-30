import * as tm from "type-mapping/fluent";
import {editId, nodeId} from "./id";
import {createdAt} from "./date-time";

export const edit = tm.fields({
    editId,
    nodeId,

    /**
     * A short string describing the content.
     */
    title : tm.mysql.varChar(0, 255),

    /**
     * A short string summarizing the content.
     */
    description : tm.mysql.varChar(0, 255),

    /**
     * The actual content itself.
     *
     * Will be processed as Markdown text.
     */
    content : tm.mysql.mediumText(),

    createdAt,
});
