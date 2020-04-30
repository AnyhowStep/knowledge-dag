import {RouteInitDelegate} from "./route-init-delegate";
import {NodeApi} from "../api";
import * as dao from "../dao";

export const initNode : RouteInitDelegate = ({app, pool}) => {
    app.createRoute(NodeApi.routes.fetchDetailed)
        .asyncVoidHandler((req, res) => pool
            .acquireReadOnlyTransaction(connection => dao.node
                .detailedQuery()
                .whereEqPrimaryKey(
                    tables => tables.node,
                    req.params
                )
                .fetchOne(connection)
            )
            .then((data) => {
                res.json(data);
            })
        );

    app.createRoute(NodeApi.routes.create)
        .asyncVoidHandler((req, res) => pool
            .acquireTransaction(connection => dao
                .node
                .create(
                    connection,
                    req.body
                )
            )
            .then((data) => {
                res.json(data);
            })
        );

    app.createRoute(NodeApi.routes.update)
        .asyncVoidHandler((req, res) => pool
            .acquireTransaction(connection => dao.node
                .update(
                    connection,
                    {
                        ...req.params,
                        ...req.body,
                    }
                )
            )
            .then(() => {
                res.status(204).end();
            })
        );

    app.createRoute(NodeApi.routes.delete)
        .asyncVoidHandler((req, res) => pool
            .acquireTransaction(connection => dao.node
                .delete(
                    connection,
                    req.params
                )
            )
            .then(() => {
                res.status(204).end();
            })
        );

    app.createRoute(NodeApi.routes.paginate)
        .asyncVoidHandler((req, res) => pool
            .acquireReadOnlyTransaction(connection => dao.node
                .simpleQuery()
                .where(() => dao.node.filter(req.query))
                .paginate(connection, req.query)
            )
            .then((data) => {
                res.json(data);
            })
        );
};
