import * as React from "react";
import * as classnames from "classnames";
import {NodeDetailed} from "../../../api-mapper";
import {Link} from "react-router-dom";
import {storage} from "../../storage";
import {parseAndRenderReact} from "../../../flavormark";

export interface DetailedItemProps {
    className? : string,
    node : NodeDetailed,
    renderViewGraphButton : boolean,
    buttons? : JSX.Element,

    renderDependencies? : boolean,
    renderDependents? : boolean,
    renderButtons? : boolean,
    renderDateTime? : boolean,
}

function zeroPadStart (str : string, length : number) {
    while (str.length < length) {
        str = "0" + str;
    }
    return str;
}
const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];
function renderDateTime (date : Date) {
    const dayOfMonth = zeroPadStart(String(date.getDate()), 2);
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const period = date.getHours() >= 12 ? "PM" : "AM";

    const h = date.getHours() >= 12 ? date.getHours()-12 : date.getHours();
    const hour = zeroPadStart(String(h), 2);
    const minute = zeroPadStart(String(date.getMinutes()), 2);

    return `${dayOfMonth} ${month}' ${year} ${hour}:${minute} ${period}`;
}

function DependencyList (node : { nodeId : bigint }, parents : NodeDetailed["dependencies"]) {
    const accessToken = storage.getAccessToken();
    const arr : JSX.Element[] = [];
    for (const p of parents) {
        arr.push(
            <li key={p.parentId.toString()}>
                {
                    (accessToken == undefined) ?
                    undefined :
                    <Link
                        className="ui button icon mini basic negative"
                        to={`/node/${node.nodeId}/dependency/${p.parentId}/delete`}
                    >
                        <i className="remove icon"></i>
                    </Link>
                }
                <Link to={`/node/${p.parentId}`}>{p.title} <small>(#{p.parentId.toString()})</small></Link>
            </li>
        );
    }
    if (arr.length == 0) {
        arr.push(
            <li key="nothing-here">
                <small>There is nothing here</small>
            </li>
        );
    }
    return (
        <ul>
            {arr}
        </ul>
    );
}

function DependentList (node : { nodeId : bigint }, children : NodeDetailed["dependents"]) {
    const accessToken = storage.getAccessToken();
    const arr : JSX.Element[] = [];
    for (const child of children) {
        arr.push(
            <li key={child.nodeId.toString()}>
                {
                    (accessToken == undefined) ?
                    undefined :
                    <Link
                        className="ui button icon mini basic negative"
                        to={`/node/${child.nodeId}/dependency/${node.nodeId}/delete`}
                    >
                        <i className="remove icon"></i>
                    </Link>
                }
                <Link to={`/node/${child.nodeId}`}>{child.title} <small>(#{child.nodeId.toString()})</small></Link>
            </li>
        );
    }
    if (arr.length == 0) {
        arr.push(
            <li key="nothing-here">
                <small>There is nothing here</small>
            </li>
        );
    }
    return (
        <ul>
            {arr}
        </ul>
    );
}

export function DetailedItem (props : DetailedItemProps) {
    return (
        <div className={classnames(props.className, "ui text container")}>
            {
                props.renderButtons == false ?
                undefined :
                <React.Fragment>
                    {props.buttons}
                    {
                        (props.renderViewGraphButton == true) ?
                        <Link to={`/graph?start=${props.node.nodeId}`} className="ui button labeled icon">
                            <i className="sitemap icon"></i>
                            View Graph
                        </Link> :
                        undefined
                    }
                    <hr/>
                </React.Fragment>
            }
            {
                props.renderDependencies == false ?
                undefined :
                <React.Fragment>
                    <h3>Dependencies</h3>
                    <h4>Direct</h4>
                    {DependencyList(
                        props.node,
                        props.node.dependencies
                            .filter(p => p.direct)
                    )}
                    <h4>Indirect</h4>
                    {DependencyList(
                        props.node,
                        props.node.dependencies
                            .filter(p => !p.direct)
                    )}
                    <hr/>
                </React.Fragment>
            }
            <h1 className="ui header" style={{ marginBottom : "0px" }}>
                {props.node.latestEdit.title}
                <Link to={`/node/${props.node.nodeId}`}>
                    <small>(#{props.node.nodeId.toString()})</small>
                </Link>
            </h1>
            {
                props.node.latestEdit.description.length == 0 ?
                undefined :
                <div className="sub header">
                    {props.node.latestEdit.description}
                </div>
            }
            {
                props.node.tags.length == 0 ?
                undefined :
                <p>
                    {props.node.tags.map(t => <span className="ui blue mini label" key={t}>{t}</span>)}
                </p>
            }
            {
                props.renderDateTime == false ?
                undefined :
                <React.Fragment>
                    <small>Created @ {renderDateTime(props.node.createdAt)}</small>
                    <br/>
                    <small>Last edited @ {renderDateTime(props.node.latestEdit.createdAt)}</small>
                </React.Fragment>
            }
            <hr/>
            <div>
                {
                    /^\s*$/.test(props.node.latestEdit.content) ?
                    <div>
                        <small>Nothing has been written yet</small>
                    </div> :
                    parseAndRenderReact(props.node.latestEdit.content)
                }
            </div>
            <hr/>
            {
                props.renderDependents == false ?
                undefined :
                <React.Fragment>
                    <h3>Dependents</h3>
                    <h4>Direct</h4>
                    {DependentList(
                        props.node,
                        props.node.dependents
                            .filter(p => p.direct)
                    )}
                    <h4>Indirect</h4>
                    {DependentList(
                        props.node,
                        props.node.dependents
                            .filter(p => !p.direct)
                    )}
                    <hr/>
                </React.Fragment>
            }
        </div>
    );
}
