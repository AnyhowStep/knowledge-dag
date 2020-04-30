import * as tm from "type-mapping/fluent";

export const auth = tm.object({
    "access-token" : tm.mysql.varChar(1, 255),
});
