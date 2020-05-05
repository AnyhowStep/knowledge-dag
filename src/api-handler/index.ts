import * as express from "route-express";
import {RouteInitArgs} from "./route-init-delegate";
import * as initRouteDelegates from "./all";

export interface InitArgs extends Pick<RouteInitArgs, "pool"> {
    readonly app : express.IMainApp<{ locals : {} }>;
    readonly accessToken : string;
}
export function init ({ app, pool, accessToken } : InitArgs) {
    const apiApp = app
        .createSubApp("/api")
        .voidHandler((req, res, next) => {
            const userAccessToken = req.headers["access-token"];
            if (userAccessToken == undefined) {
                next();
                return;
            }

            if (userAccessToken == accessToken) {
                next();
                return;
            }

            res.status(401).end();
        });
    for (const initRouteDelegate of Object.values(initRouteDelegates)) {
        initRouteDelegate({
            app : apiApp,
            pool,
        });
    }
}
