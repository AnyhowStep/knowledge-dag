import * as path from "path";
import * as sql from "@squill/squill";
import * as express from "route-express";
import * as rawExpress from "express";
import * as apiHandler from "../../api-handler";

export interface RouteInitArgs {
    readonly pool : sql.IPool;
    readonly app : express.IMainApp<{ locals : {} }>;
    readonly accessToken : string;
}

export function initRoute ({ pool, app, accessToken } : RouteInitArgs) {
    apiHandler.init({
        app,
        pool,
        accessToken,
    });

    app.use(
        rawExpress.static(__dirname + "/../../../client")
    );
    app.get("*", function (req, res) {
        if (res.headersSent) {
            return;
        }
        if (
            req.path.startsWith("/img") ||
            req.path.startsWith("/api") ||
            req.path.startsWith("/themes")
        ) {
            res.status(404).end();
            return;
        }
        res.sendFile(path.resolve(__dirname + "/../../../client/index.html"));
    });

}
