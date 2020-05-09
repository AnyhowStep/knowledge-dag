import * as React from "react";
import * as classnames from "classnames";
import * as lzString from "lz-string";
import {ErrorMessage} from "../../ui";
import {RouteComponentProps} from "react-router";
import {useFetch, DetailedItem} from "../node";

export interface BuildProps extends RouteComponentProps<{ nodeId : string }> {

}

export function Build (props : BuildProps) {
    const [nodes, setNodeIds] = React.useState<{ nodeId : string, depth : number }[]>([]);
    const [open, setOpen] = React.useState<string[]>([props.match.params.nodeId]);
    const [closed, setClosed] = React.useState<string[]>([]);

    const [curNodeId, ...otherOpenIds] = open;

    const {
        error,
        node,
    } = useFetch({
        nodeId : curNodeId,
    });

    return (
        <div
            className="ui main container"
        >
            <div className={classnames({
                "ui loader" : true,
                "active" : node == undefined,
            })}></div>
            <ErrorMessage error={error}/>
            {
                node == undefined ?
                undefined :
                node.nodeId.toString() == props.match.params.nodeId ?
                <DetailedItem
                    className=""
                    node={node}
                    renderViewGraphButton={false}
                    renderDependencies={false}
                    renderDependents={false}
                    renderButtons={true}
                    renderDateTime={false}
                    buttons={
                        <React.Fragment>
                            A textbook will be built to understand this node.
                            <br/>
                            <button
                                className="ui button"
                                onClick={() => {
                                    const newNodes = [
                                        ...nodes,
                                        {
                                            nodeId : node.nodeId.toString(),
                                            depth : Number(node.depth),
                                        },
                                    ];
                                    const newOpen = [
                                        ...otherOpenIds,
                                        ...node.dependencies
                                            .map(dependency => dependency.parentId.toString())
                                            .filter(nodeId => {
                                                return (
                                                    !nodes.some(node => node.nodeId == nodeId) &&
                                                    !open.includes(nodeId) &&
                                                    !closed.includes(nodeId)
                                                );
                                            })
                                    ];

                                    if (newOpen.length == 0) {
                                        const lzData = lzString.compressToEncodedURIComponent(
                                            JSON.stringify(
                                                newNodes
                                                    .sort((a, b) => a.depth-b.depth)
                                                    .map(({nodeId}) => nodeId)
                                            )
                                        );
                                        props.history.push(`/textbook/${lzData}`);
                                    } else {
                                        setNodeIds(newNodes);
                                        setOpen(newOpen);
                                        setClosed([...closed, curNodeId]);
                                    }
                                }}
                            >
                                Continue
                            </button>
                        </React.Fragment>
                    }
                /> :
                <DetailedItem
                    className=""
                    node={node}
                    renderViewGraphButton={false}
                    renderDependencies={false}
                    renderDependents={false}
                    renderButtons={true}
                    renderDateTime={false}
                    buttons={
                        <React.Fragment>
                            Do you understand this node?
                            <br/>
                            <button
                                className="ui positive button"
                                onClick={() => {
                                    if (otherOpenIds.length == 0) {
                                        const lzData = lzString.compressToEncodedURIComponent(
                                            JSON.stringify(
                                                nodes
                                                    .sort((a, b) => a.depth-b.depth)
                                                    .map(({nodeId}) => nodeId)
                                            )
                                        );
                                        props.history.push(`/textbook/${lzData}`);
                                    } else {
                                        setOpen(otherOpenIds);
                                        setClosed([...closed, curNodeId]);
                                    }
                                }}
                            >
                                Yes
                            </button>
                            <button
                                className="ui negative button"
                                onClick={() => {
                                    const newNodes = [
                                        ...nodes,
                                        {
                                            nodeId : node.nodeId.toString(),
                                            depth : Number(node.depth),
                                        },
                                    ];
                                    const newOpen = [
                                        ...otherOpenIds,
                                        ...node.dependencies
                                            .map(dependency => dependency.parentId.toString())
                                            .filter(nodeId => {
                                                return (
                                                    !nodes.some(node => node.nodeId == nodeId) &&
                                                    !open.includes(nodeId) &&
                                                    !closed.includes(nodeId)
                                                );
                                            })
                                    ];

                                    if (newOpen.length == 0) {
                                        const lzData = lzString.compressToEncodedURIComponent(
                                            JSON.stringify(
                                                newNodes
                                                    .sort((a, b) => a.depth-b.depth)
                                                    .map(({nodeId}) => nodeId)
                                            )
                                        );
                                        props.history.push(`/textbook/${lzData}`);
                                    } else {
                                        setNodeIds(newNodes);
                                        setOpen(newOpen);
                                        setClosed([...closed, curNodeId]);
                                    }
                                }}
                            >
                                No
                            </button>
                        </React.Fragment>
                    }
                />
            }
        </div>
    );

}
