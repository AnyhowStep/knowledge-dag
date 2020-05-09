import * as React from "react";
import * as classnames from "classnames";
import {RouteComponentProps} from "react-router";
import {ErrorMessage} from "../../ui/error-message";
import {DetailedItem} from "./detailed-item";
import {storage} from "../../storage";
import {Link} from "react-router-dom";
import {useFetch} from "./use-fetch";

export interface FetchProps extends RouteComponentProps<{ nodeId : string }> {

}

export const Fetch = (props : FetchProps) => {
    const {
        error,
        node,
    } = useFetch({
        nodeId : props.match.params.nodeId,
    });

    return (
        <div className="ui main container">
            <div className={classnames({
                "ui loader" : true,
                "active" : node == undefined,
            })}></div>
            <ErrorMessage error={error}/>
            {
                node == undefined ?
                undefined :
                <DetailedItem
                    className=""
                    node={node}
                    renderViewGraphButton={true}
                    buttons={
                        storage.getAccessToken() == undefined ?
                        undefined :
                        <div
                            className={"ui simple dropdown item button"}
                        >
                            Actions
                            <i className="dropdown icon"></i>
                            <div className="menu">
                                <Link className="ui item" to={`/node/${node.nodeId}/update`}>
                                    Edit
                                </Link>
                                <Link className="ui item" to={`/node/${node.nodeId}/dependency/create`}>
                                    Create Dependency
                                </Link>
                                {
                                    (node.dependencies.length == 0 && node.dependents.length == 0) ?
                                    <Link className="ui item" to={`/node/${node.nodeId}/delete`}>Delete</Link> :
                                    undefined
                                }
                                <Link className="ui item" to={`/node/${node.nodeId}/textbook/build`}>
                                    Build Textbook
                                </Link>
                            </div>
                        </div>
                    }
                />
            }
        </div>
    );
};
