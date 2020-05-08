import * as React from "react";
import * as classnames from "classnames";
import {ErrorMessage} from "../../ui/error-message";
import {DetailedItem} from "./detailed-item";
import {Link} from "react-router-dom";
import {useFetch} from "./use-fetch";

export interface TextbookDetailedItemProps {
    className : string,
    nodeId : string,
}

export const TextbookDetailedItem = (props : TextbookDetailedItemProps) => {
    const {
        error,
        node,
    } = useFetch({
        nodeId : props.nodeId,
    });

    return (
        <div
            className={classnames(
                "",
                props.className
            )}
            style={{
                paddingTop : "10px",
            }}
        >
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
                    renderDependencies={false}
                    renderDependents={false}
                    renderButtons={false}
                    renderDateTime={false}
                    buttons={
                        <div
                            className={"ui simple dropdown item button"}
                        >
                            Actions
                            <i className="dropdown icon"></i>
                            <div className="menu">
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
