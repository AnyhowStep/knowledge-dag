import * as tm from "type-mapping/fluent";
import * as rd from "../route-declaration";
import * as rc from "route-client";
import * as mapper from "../mapper";
import * as apiMapper from "../api-mapper";

export const DependencyApi = rc.toAxiosApi({
    create : rd.route()
        .setMethod("PUT")
        .append("/node")
        .appendParam(mapper.dependency.nodeId, /\d+/)
        .append("/dependency")
        .appendParam(mapper.dependency.parentId, /\d+/)
        .setHeader(apiMapper.auth),

    delete : rd.route()
        .setMethod("DELETE")
        .append("/node")
        .appendParam(mapper.dependency.nodeId, /\d+/)
        .append("/dependency")
        .appendParam(mapper.dependency.parentId, /\d+/)
        .setHeader(apiMapper.auth),

    paginateParentDetailed : rd.paginate(
        rd.route()
            .setMethod("GET")
            .append("/dependency/parent/detailed")
            .setQuery(tm.object(
                mapper.dependency.nodeId.optional(),
            )),
        apiMapper.parentDetailed
    ),

    paginateChildDetailed : rd.paginate(
        rd.route()
            .setMethod("GET")
            .append("/dependency/child/detailed")
            .setQuery(tm.object(
                mapper.dependency.parentId.optional(),
            )),
        apiMapper.childDetailed
    ),
});

export type DependencyApi = InstanceType<typeof DependencyApi>;
