import * as tm from "type-mapping";

export const {
    createdAt,
} = tm.fields({
    createdAt : tm.mysql.dateTime(3),
});
