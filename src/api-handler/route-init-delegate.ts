import * as sql from "@squill/squill";
import * as express from "route-express";

export interface RouteInitArgs {
    readonly app : express.ParentApp<{}>,
    readonly pool : sql.IPool,
}

export type RouteInitDelegate = (args : RouteInitArgs) => void;
