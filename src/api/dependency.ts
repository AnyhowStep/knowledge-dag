import * as rd from "../route-declaration";
import * as rc from "route-client";
import * as mapper from "../mapper";
import * as apiMapper from "../api-mapper";

export const DependencyApi = rc.toAxiosApi({
    create : rd.route()
        .setMethod("PUT")
        .append("/node")
        .appendParam(mapper.dependency.nodeId)
        .append("/dependency")
        .appendParam(mapper.dependency.parentId)
        .setHeader(apiMapper.auth),

    delete : rd.route()
        .setMethod("DELETE")
        .append("/node")
        .appendParam(mapper.dependency.nodeId)
        .append("/dependency")
        .appendParam(mapper.dependency.parentId)
        .setHeader(apiMapper.auth),
});

export type DependencyApi = InstanceType<typeof DependencyApi>;
