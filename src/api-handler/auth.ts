import {RouteInitDelegate} from "./route-init-delegate";
import {AuthApi} from "../api";

export const initAuth : RouteInitDelegate = ({app}) => {
    app.createRoute(AuthApi.routes.authenticate)
        .voidHandler((_req, res) => {
            /**
             * The `auth` middleware should have already rejected
             * the request, if the `access-token` was invalid.
             */
            res.status(204).end();
        });
};
