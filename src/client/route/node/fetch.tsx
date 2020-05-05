import * as React from "react";
import * as classnames from "classnames";
import {bigIntLib} from "bigint-lib";
import {useError} from "../../ui";
import {api} from "../../api";
import {NodeDetailed} from "../../../api-mapper";
import {RouteComponentProps} from "react-router";
import {ErrorMessage} from "../../ui/error-message";
import {DetailedItem} from "./detailed-item";
import {storage} from "../../storage";
import {Link} from "react-router-dom";

export interface FetchProps extends RouteComponentProps<{ nodeId : string }> {

}

export const Fetch = (props : FetchProps) => {
    const error = useError();

    const [node, setNode] = React.useState<NodeDetailed|undefined>(undefined);

    React.useEffect(
        () => {
            setNode(undefined);
            let cancelled = false;
            api.node.fetchDetailed()
                .setParam({
                    nodeId : bigIntLib.BigInt(props.match.params.nodeId),
                })
                .send()
                .then((response) => {
                    if (cancelled) {
                        return;
                    }
                    setNode(response.responseBody)
                    error.reset();
                })
                .catch((err) => {
                    if (cancelled) {
                        return;
                    }
                    error.push("negative", err.message);
                })
            return () => {
                cancelled = true;
            }
        },
        [props.match.params.nodeId]
    );

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
                            </div>
                        </div>
                    }
                />
            }
        </div>
    );
};
