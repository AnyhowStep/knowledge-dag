import * as rd from "../route-declaration";
import * as rc from "route-client";
import * as apiMapper from "../api-mapper";

export const DirtyNodeApi = rc.toAxiosApi({
    /**
     * Marks all `root` nodes as "dirty".
     * Triggers depth and direct-edge computation on all graphs.
     */
    createForRoot : rd.route()
        .setMethod("POST")
        .append("/dirty-node/root")
        .setHeader(apiMapper.auth),
});

export type DirtyNodeApi = InstanceType<typeof DirtyNodeApi>;
