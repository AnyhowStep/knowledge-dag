import * as React from "react";
import * as classnames from "classnames";
import {bigIntLib} from "bigint-lib";
import {useError} from "../../ui";
import {api} from "../../api";
import {NodeDetailed} from "../../../api-mapper";
import {ErrorMessage} from "../../ui/error-message";
import {DetailedItem} from "./detailed-item";
import {Link} from "react-router-dom";

export interface DynamicDetailedItemProps {
    className : string,
    nodeId : string,
    open : boolean,
    onClose : () => void,
}

export const DynamicDetailedItem = (props : DynamicDetailedItemProps) => {
    const error = useError();

    const [node, setNode] = React.useState<NodeDetailed|undefined>(undefined);

    React.useEffect(
        () => {
            setNode(undefined);
            let cancelled = false;
            api.node.fetchDetailed()
                .setParam({
                    nodeId : bigIntLib.BigInt(props.nodeId),
                })
                .send()
                .then((response) => {
                    if (cancelled) {
                        return;
                    }
                    setNode(response.responseBody);
                    error.reset();
                })
                .catch((err) => {
                    if (cancelled) {
                        return;
                    }
                    error.push("negative", err.message);
                });
            return () => {
                cancelled = true;
            };
        },
        [props.nodeId]
    );

    return (
        <div className={classnames(
            "ui main container",
            props.className
        )}>
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
                        <div
                            className={"ui simple dropdown item button"}
                        >
                            Actions
                            <i className="dropdown icon"></i>
                            <div className="menu">
                                <div
                                    className="ui item"
                                    onClick={props.onClose}
                                >
                                    Close
                                </div>
                                <Link className="ui item" to={`/node/${node.nodeId}`}>
                                    Open Page
                                </Link>
                            </div>
                        </div>
                    }
                />
            }
        </div>
    );
};
