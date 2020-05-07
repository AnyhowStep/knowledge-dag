import * as sql from "@squill/squill";
import {RouteInitDelegate} from "./route-init-delegate";
import {TagApi} from "../api";
import * as dao from "../dao";

export const initTag : RouteInitDelegate = ({app, pool}) => {
    app.createRoute(TagApi.routes.fetchWithCount)
        .asyncVoidHandler((req, res) => pool
            .acquireReadOnlyTransaction(
                sql.IsolationLevel.REPEATABLE_READ,
                connection => dao.tag
                    .withCountQuery()
                    .whereEqPrimaryKey(
                        tables => tables.tag,
                        req.params
                    )
                    .fetchOne(connection)
            )
            .then((data) => {
                res.json(data);
            })
        );

    app.createRoute(TagApi.routes.update)
        .asyncVoidHandler((req, res) => pool
            .acquireTransaction(connection => dao.tag
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

    app.createRoute(TagApi.routes.delete)
        .asyncVoidHandler((req, res) => pool
            .acquireTransaction(connection => dao.tag
                .delete(
                    connection,
                    req.params
                )
            )
            .then(() => {
                res.status(204).end();
            })
        );

    app.createRoute(TagApi.routes.paginate)
        .asyncVoidHandler((req, res) => pool
            .acquireReadOnlyTransaction(
                sql.IsolationLevel.REPEATABLE_READ,
                connection => dao.tag
                    .titleQuery()
                    .where(() => dao.tag.filter(req.query))
                    .paginate(connection, req.query)
            )
            .then((data) => {
                res.json(data);
            })
        );

    app.createRoute(TagApi.routes.paginateWithCount)
        .asyncVoidHandler((req, res) => pool
            .acquireReadOnlyTransaction(
                sql.IsolationLevel.REPEATABLE_READ,
                connection => dao.tag
                    .withCountQuery()
                    .where(() => dao.tag.filter(req.query))
                    .paginate(connection, req.query)
            )
            .then((data) => {
                res.json(data);
            })
        );
};
