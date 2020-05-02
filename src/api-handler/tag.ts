import {RouteInitDelegate} from "./route-init-delegate";
import {TagApi} from "../api";
import * as dao from "../dao";

export const initTag : RouteInitDelegate = ({app, pool}) => {
    app.createRoute(TagApi.routes.paginate)
        .asyncVoidHandler((req, res) => pool
            .acquireReadOnlyTransaction(connection => dao.tag
                .titleQuery()
                .where(() => dao.tag.filter(req.query))
                .paginate(connection, req.query)
            )
            .then((data) => {
                res.json(data);
            })
        );
};
