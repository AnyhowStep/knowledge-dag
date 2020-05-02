import * as express from "route-express";
import {RouteInitArgs} from "./route-init-delegate";
import * as initRouteDelegates from "./all";

export interface InitArgs extends Pick<RouteInitArgs, "pool"> {
    readonly app : express.IMainApp<{ locals : {} }>;
}
export function init ({ app, pool } : InitArgs) {
    const apiApp = app.createSubApp("/api");
    for (const initRouteDelegate of Object.values(initRouteDelegates)) {
        initRouteDelegate({
            app : apiApp,
            pool,
        });
    }
}
