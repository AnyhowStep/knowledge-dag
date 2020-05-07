import {AxiosSenderArgs} from "route-client";
import {AuthApi} from "./auth";
import {NodeApi} from "./node";
import {TagApi} from "./tag";
import {DependencyApi} from "./dependency";

export interface ApiArgs extends AxiosSenderArgs {

}

export class Api {
    readonly auth : AuthApi;
    readonly node : NodeApi;
    readonly tag : TagApi;
    readonly dependency : DependencyApi;

    constructor (args : ApiArgs) {
        this.auth = new AuthApi(args);
        this.node = new NodeApi(args);
        this.tag = new TagApi(args);
        this.dependency = new DependencyApi(args);
    }
}
