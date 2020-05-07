import * as sql from "@squill/squill";
import {RouteInitDelegate} from "./route-init-delegate";
import {DependencyApi} from "../api";
import * as table from "../table";
import * as dao from "../dao";

export const initDependency : RouteInitDelegate = ({app, pool}) => {
    app.createRoute(DependencyApi.routes.create)
        .asyncVoidHandler((req, res) => pool
            .acquireTransaction(
                sql.IsolationLevel.REPEATABLE_READ,
                async (connection) => {
                    if (
                        await table.dependency.whereEqPrimaryKey(req.params).exists(connection)
                    ) {
                        return false;
                    }
                    await dao
                        .dependency
                        .create(
                            connection,
                            req.params
                        );
                    return true;
                }
            )
            .then((created) => {
                if (created) {
                    res.status(204).end();
                } else {
                    res.status(304).end();
                }
            })
        );

    app.createRoute(DependencyApi.routes.delete)
        .asyncVoidHandler((req, res) => pool
            .acquireTransaction(async (connection) => {
                if (
                    !(await table.dependency.whereEqPrimaryKey(req.params).exists(connection))
                ) {
                    return false;
                }
                await dao.dependency
                    .delete(
                        connection,
                        req.params
                    );
                return true;
            })
            .then((deleted) => {
                if (deleted) {
                    res.status(204).end();
                } else {
                    res.status(304).end();
                }
            })
        );

    app.createRoute(DependencyApi.routes.paginateParentDetailed)
        .asyncVoidHandler((req, res) => pool
            .acquireReadOnlyTransaction(
                sql.IsolationLevel.REPEATABLE_READ,
                connection => dao.dependency
                    .parentDetailedQuery()
                    .where(() => dao.dependency.filter(req.query))
                    .paginate(connection, req.query)
            )
            .then((data) => {
                res.json(data);
            })
        );

    app.createRoute(DependencyApi.routes.paginateChildDetailed)
        .asyncVoidHandler((req, res) => pool
            .acquireReadOnlyTransaction(
                sql.IsolationLevel.REPEATABLE_READ,
                connection => dao.dependency
                    .childDetailedQuery()
                    .where(() => dao.dependency.filter(req.query))
                    .paginate(connection, req.query)
            )
            .then((data) => {
                res.json(data);
            })
        );
};
