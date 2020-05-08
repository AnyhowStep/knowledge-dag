import * as sql from "@squill/squill";
import {RouteInitDelegate} from "./route-init-delegate";
import {DirtyNodeApi} from "../api";
import * as dao from "../dao";
import * as table from "../table";

export const initDirtyNode : RouteInitDelegate = ({app, pool}) => {
    app.createRoute(DirtyNodeApi.routes.createForRoot)
        .asyncVoidHandler((_req, res) => pool
            .acquireTransaction(connection => {
                return sql.from(table.node)
                    .select(columns => [columns.nodeId])
                    .where(() => dao.node.isRoot())
                    .replace(
                        connection,
                        table.dirtyNode,
                        columns => {
                            return {
                                nodeId : columns.nodeId,
                            };
                        }
                    );
            })
            .then(() => {
                res.status(204).end();
            })
        );
};
