import * as tm from "type-mapping/fluent";
import * as rd from "../route-declaration";
import * as rc from "route-client";
import * as mapper from "../mapper";

export const TagApi = rc.toAxiosApi({
    paginate : rd.paginate(
        rd.route()
            .setMethod("GET")
            .append("/tag")
            .setQuery(tm.object(
                tm.array(tm.mysql.varChar(3, 255)).withName("title").optional(),
            )),
        mapper.tag.title
    ),
});

export type TagApi = InstanceType<typeof TagApi>;
