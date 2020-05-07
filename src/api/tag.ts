import * as tm from "type-mapping/fluent";
import * as rd from "../route-declaration";
import * as rc from "route-client";
import * as mapper from "../mapper";
import * as apiMapper from "../api-mapper";

export const TagApi = rc.toAxiosApi({
    fetchWithCount : rd.route()
        .setMethod("GET")
        .append("/tag")
        .appendParam(mapper.tagId, /\d+/)
        .append("/with-count")
        .setResponse(apiMapper.tagWithCount),

    update : rd.route()
        .setMethod("PUT")
        .append("/tag")
        .appendParam(mapper.tagId, /\d+/)
        .setHeader(apiMapper.auth)
        .setBody(apiMapper.updateTagBody),

    delete : rd.route()
        .setMethod("DELETE")
        .append("/tag")
        .appendParam(mapper.tagId, /\d+/)
        .setHeader(apiMapper.auth),

    paginate : rd.paginate(
        rd.route()
            .setMethod("GET")
            .append("/tag")
            .setQuery(tm.object(
                tm.array(tm.mysql.varChar(3, 255)).withName("title").optional(),
            )),
        mapper.tag.title
    ),

    paginateWithCount : rd.paginate(
        rd.route()
            .setMethod("GET")
            .append("/tag")
            .append("/with-count")
            .setQuery(tm.object(
                tm.array(tm.mysql.varChar(3, 255)).withName("title").optional(),
            )),
        apiMapper.tagWithCount
    ),
});

export type TagApi = InstanceType<typeof TagApi>;
