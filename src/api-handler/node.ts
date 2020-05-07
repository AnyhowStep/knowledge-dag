import * as sql from "@squill/squill";
import {RouteInitDelegate} from "./route-init-delegate";
import {NodeApi} from "../api";
import * as dao from "../dao";
import * as table from "../table";

export const initNode : RouteInitDelegate = ({app, pool}) => {
    app.createRoute(NodeApi.routes.fetchSimple)
        .asyncVoidHandler((req, res) => pool
            .acquireReadOnlyTransaction(
                sql.IsolationLevel.REPEATABLE_READ,
                connection => dao.node
                    .simpleQuery()
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

    app.createRoute(NodeApi.routes.fetchDetailed)
        .asyncVoidHandler((req, res) => pool
            .acquireReadOnlyTransaction(
                sql.IsolationLevel.REPEATABLE_READ,
                connection => dao.node
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

    app.createRoute(NodeApi.routes.fetchRandomSimple)
        .asyncVoidHandler((_req, res) => pool
            .acquireReadOnlyTransaction(
                sql.IsolationLevel.REPEATABLE_READ,
                async (connection) => {
                    const node = await sql
                        .from(table.node)
                        .select(columns => [
                            columns.nodeId
                        ])
                        .orderBy(() => [
                            sql.integer.randomBigIntSigned().asc(),
                        ])
                        .limit(1)
                        .fetchOne(connection);

                    return dao.node
                        .simpleQuery()
                        .whereEqPrimaryKey(
                            tables => tables.node,
                            node
                        )
                        .fetchOne(connection);
                }
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
            .acquireReadOnlyTransaction(
                sql.IsolationLevel.REPEATABLE_READ,
                connection => dao.node
                    .simpleQuery()
                    .where(() => dao.node.filter(req.query))
                    .paginate(connection, req.query)
            )
            .then((data) => {
                res.json(data);
            })
        );
};
