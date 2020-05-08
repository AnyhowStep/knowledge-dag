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
                        <Link className="ui item" to={`/node`}>Nodes</Link>
                        <Link className="ui item" to={`/tag`}>Tags</Link>
                        <Link className="ui item" to={`/graph?random=true`}>Graph</Link>
                        {
                            storage.getAccessToken() == undefined ?
                            undefined :
                            <Link className="ui item" to={`/markdown-help`}>Markdown Help</Link>
                        }
                    </div>
                </div>
                {
                    storage.getAccessToken() == undefined ?
                    <Link className="item" to="/access-token">
                        Access Token
                    </Link> :
                    <Link className="item" to="/log-out">
                        Log Out
                    </Link>
                }
            </div>
            <div className="pusher" style={{height:"100%"}}>
                <DefaultMenu
                    sidebarHook={sidebar}
                />
                <Switch>
                    <Route path="/node/create" component={r.node.Create}/>
                    <Route path="/node/:nodeId(\d+)/update" component={r.node.Update}/>
                    <Route path="/node/:nodeId(\d+)/delete" component={r.node.Delete}/>
                    <Route path="/node/:nodeId(\d+)/dependency/create" component={r.dependency.Create}/>
                    <Route path="/node/:nodeId(\d+)/dependency/:parentId(\d+)/delete" component={r.dependency.Delete}/>
                    <Route path="/node/:nodeId(\d+)" component={r.node.Fetch}/>
                    <Route path="/node" component={r.node.Paginate}/>

                    <Route path="/tag/:tagId(\d+)/update" component={r.tag.Update}/>
                    <Route path="/tag/:tagId(\d+)/delete" component={r.tag.Delete}/>
                    <Route path="/tag" component={r.tag.Paginate}/>

                    <Route path="/graph" component={r.graph.Graph}/>
                    <Route path="/access-token" component={r.AccessToken}/>
                    <Route path="/log-out" component={r.LogOut}/>
                    <Route path="/markdown-help" component={r.MarkdownHelp}/>

                    <Route path="/" component={r.HomePage}/>
                </Switch>
            </div>
        </BrowserRouter>
    );
}
