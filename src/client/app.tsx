import * as React from "react";
import {useDropdown} from "./ui";
import {BrowserRouter, Switch, Route, Link} from "react-router-dom";
import {DefaultMenu} from "./default-menu";
import * as r from "./route";
import {storage} from "./storage";


export interface Props {

}
export interface State {
}
export function App (_props : Props) {
    const sidebar = useDropdown({
        openClassName : "uncover visible",
        closeClassName : "uncover animating",
    });
    return (
        <BrowserRouter>
            <div id="main-sidebar" className={sidebar.className("ui sidebar inverted vertical massive menu left overlay")}>
                <Link className="item" to="/">
                    Home
                </Link>
                {
                    storage.getAccessToken() == undefined ?
                    undefined :
                    <Link className="item" to="/node/create">
                        Create Node
                    </Link>
                }
                <div className="item">
                    Links
                    <div className="menu">
                        <Link className="ui item" to={`/tag`}>Tags</Link>
                        <Link className="ui item" to={`/graph`}>Graph</Link>
                    </div>
                </div>
                <Link className="item" to="/access-token">
                    Access Token
                </Link>
            </div>
            <div className="pusher" style={{minHeight:"100%"}}>
                <DefaultMenu
                    sidebarHook={sidebar}
                />
                <Switch>
                    <Route path="/node/create" component={r.node.Create}/>
                    <Route path="/node/:nodeId(\d+)/update" component={r.NotImplemented}/>
                    <Route path="/node/:nodeId(\d+)" component={r.NotImplemented}/>
                    <Route path="/tag" component={r.NotImplemented}/>
                    <Route path="/graph" component={r.NotImplemented}/>
                    <Route path="/access-token" component={r.AccessToken}/>

                    <Route path="/" component={r.HomePage}/>
                </Switch>
                <div className="ui vertical footer segment">
                    <div className="ui center aligned container">
                        <div className="ui stackable grid">
                            <div className="sixteen wide column">
                                <h4 className="ui header">Made with <i className="heart icon"></i></h4>
                                <p>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BrowserRouter>
    );
}