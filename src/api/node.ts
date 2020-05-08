import * as tm from "type-mapping/fluent";
import * as rd from "../route-declaration";
import * as rc from "route-client";
import * as mapper from "../mapper";
import * as apiMapper from "../api-mapper";

export const NodeApi = rc.toAxiosApi({
    fetchSimple : rd.route()
        .setMethod("GET")
        .append("/node")
        .appendParam(mapper.nodeId, /\d+/)
        .append("/simple")
        .setResponse(apiMapper.nodeSimple),

    fetchDetailed : rd.route()
        .setMethod("GET")
        .append("/node")
        .appendParam(mapper.nodeId, /\d+/)
        .append("/detailed")
        .setResponse(apiMapper.nodeDetailed),

    fetchRandomSimple : rd.route()
        .setMethod("GET")
        .append("/node")
        .append("/random")
        .append("/simple")
        .setResponse(apiMapper.nodeSimple),

    create : rd.route()
        .setMethod("POST")
        .append("/node")
        .setHeader(apiMapper.auth)
        .setBody(apiMapper.createNodeBody)
        .setResponse(tm.object(
            mapper.nodeId
        )),

    update : rd.route()
        .setMethod("PUT")
        .append("/node")
        .appendParam(mapper.nodeId, /\d+/)
        .setHeader(apiMapper.auth)
        .setBody(apiMapper.updateNodeBody),

    delete : rd.route()
        .setMethod("DELETE")
        .append("/node")
        .appendParam(mapper.nodeId, /\d+/)
        .setHeader(apiMapper.auth),

    paginate : rd.paginate(
        rd.route()
            .setMethod("GET")
            .append("/node")
            .setQuery(tm.object(
                tm.array(tm.mysql.varChar(3, 255)).withName("title").optional(),
                tm.array(tm.mysql.varChar(3, 255)).withName("tag").optional(),
                tm.array(tm.mysql.varChar(3, 255)).withName("keyword").optional(),

                tm.array(tm.mysql.varChar(3, 255)).withName("tagExact").optional(),

                tm.mysql.boolean().withName("dirty").optional(),
            )),
        apiMapper.nodeSimple
    ),
});

export type NodeApi = InstanceType<typeof NodeApi>;
