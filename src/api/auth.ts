import * as rd from "../route-declaration";
import * as rc from "route-client";
import * as apiMapper from "../api-mapper";

export const AuthApi = rc.toAxiosApi({
    authenticate : rd.route()
        .setMethod("GET")
        .append("/authenticate")
        .setHeader(apiMapper.auth),
});

export type AuthApi = InstanceType<typeof AuthApi>;
