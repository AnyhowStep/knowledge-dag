import * as path from "path";
import * as sql from "@squill/squill";
import * as express from "route-express";
import * as rawExpress from "express";
import * as apiHandler from "../../api-handler";

export interface RouteInitArgs {
    readonly pool : sql.IPool;
    readonly app : express.IMainApp<{ locals : {} }>;
}

export function initRoute ({ pool, app } : RouteInitArgs) {
    apiHandler.init({
        app,
        pool,
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
