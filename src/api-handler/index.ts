import * as express from "route-express";
import {RouteInitArgs} from "./route-init-delegate";
import * as initRouteDelegates from "./all";

export interface InitArgs extends Pick<RouteInitArgs, "pool"> {
    readonly app : express.IMainApp<{ locals : {} }>;
    readonly accessToken : string;
}
export function init ({ app, pool, accessToken } : InitArgs) {
    /**
     * Lame attempt at ip blocking
     * @todo Use some better library or something.
     * Or don't even have it at this level, maybe rely on a reverse proxy or w/e
     */
    const logInAttempts = new Map<string, { firstAttemptAt : Date, failedCount : number }>();

    function isBanned (ipAddress : string) : boolean {
        const obj = logInAttempts.get(ipAddress);
        if (obj == undefined) {
            return false;
        }
        if (obj.failedCount < 5) {
            return false;
        }
        //five minute ban
        if (obj.firstAttemptAt.getTime() + 5 * 60 * 1000 <= new Date().getTime()) {
            //no longer banned
            logInAttempts.delete(ipAddress);
            return false;
        }
        return true;
    }

    function addLogInAttempt (ipAddress : string) {
        const obj = logInAttempts.get(ipAddress);
        if (obj == undefined) {
            logInAttempts.set(ipAddress, {
                firstAttemptAt : new Date(),
                failedCount : 1,
            });
        } else {
            logInAttempts.set(ipAddress, {
                firstAttemptAt : obj.firstAttemptAt,
                failedCount : obj.failedCount + 1,
            });
        }
    }

    const apiApp = app
        .createSubApp("/api")
        .voidHandler((req, res, next) => {
            const ipAddress = req.ip;
            if (ipAddress == undefined) {
                /**
                 * User probably closed the connection before
                 * we asked for the ip address.
                 */
                return;
            }

            if (isBanned(ipAddress)) {
                res.status(429).end();
                return;
            }

            const userAccessToken = req.headers["access-token"];
            if (userAccessToken == undefined) {
                next();
                return;
            }

            if (userAccessToken == accessToken) {
                next();
                return;
            }

            addLogInAttempt(ipAddress);
            res.status(401).end();
        });
    for (const initRouteDelegate of Object.values(initRouteDelegates)) {
        initRouteDelegate({
            app : apiApp,
            pool,
        });
    }
}
