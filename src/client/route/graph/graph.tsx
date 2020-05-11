import * as React from "react";
import * as classnames from "classnames";
import {RouteComponentProps} from "react-router-dom";
import * as vis from "vis";
import "vis/dist/vis.min.css";
import {bigIntLib} from "bigint-lib";
import {networkOptions} from "./network-options";
import {DataSetWrapper} from "./data-set-wrapper";
import {QueryUtil, useError, ErrorMessage} from "../../ui";
import {VisNode, VisEdge} from "./model";
import {explore} from "./explore";
import {parseQuery} from "./parse-query";
import {api} from "../../api";
import {addNode} from "./add-or-update-edge";
import {exploreRecursive} from "./explore-recursive";
import {DynamicDetailedItem} from "../node";

const MAX_RECURSION_COUNT = 10;

const DEFAULT_RECURSION_COUNT = 5;

export function Graph (props : RouteComponentProps<{}>) {
    const error = useError();
    const loadingCount = React.useRef(0);

    const [/* renderCount */, setRenderCount] = React.useState(0);

    function incrementLoadingCount () {
        ++loadingCount.current;
        setRenderCount(loadingCount.current);
    }
    function decrementLoadingCount () {
        --loadingCount.current;
        setRenderCount(loadingCount.current);
    }

    const renderElement = React.useRef<HTMLDivElement|null>(null);

    const [network, setNetwork] = React.useState<vis.Network|undefined>();
    const [nodes] = React.useState(new DataSetWrapper<VisNode>());
    const [edges] = React.useState(new DataSetWrapper<VisEdge>());
    const [firstAddedNode] = React.useState<{ current : VisNode|undefined }>({ current : undefined });
    const {current:onInconsistencyDetected} = React.useRef(() => {
        error.push(
            "negative",
            ["An inconsistency in the graph was detected. It may have been updated. Please refresh the page."]
        );
    });
    const searchRef = React.useRef(props.location.search);
    searchRef.current = props.location.search;

    React.useEffect(
        () => {
            console.log("renderElement effect");
            if (renderElement.current == undefined) {
                console.log("No renderElement");
                return;
            }
            if (network != undefined) {
                console.warn(`Network already instantiated`);
                return;
            }
            const newNetwork = new vis.Network(
                renderElement.current,
                {
                    nodes : nodes.dataSet,
                    edges : edges.dataSet,
                },
                networkOptions
            );

            const onNodeSelected = (e : { nodes : string[] }) => {
                console.log("onNodeSelected", e.nodes);
                const query = QueryUtil.toObject(searchRef.current);
                const selectedNodeId = QueryUtil.getString(query, "selectedNodeId", undefined);
                if (e.nodes.length == 0) {
                    if (selectedNodeId != undefined) {
                        const search = QueryUtil.mutateSearch(
                            searchRef.current,
                            {
                                update : {
                                    random : undefined,
                                    selectedNodeId : undefined,
                                }
                            }
                        );
                        props.history.replace(`${props.location.pathname}${search}`);
                    }
                } else {
                    if (selectedNodeId != e.nodes[0]) {
                        const search = QueryUtil.mutateSearch(
                            searchRef.current,
                            {
                                update : {
                                    random : undefined,
                                    selectedNodeId : e.nodes[0],
                                }
                            }
                        );
                        props.history.replace(`${props.location.pathname}${search}`);
                    }
                }
            };

            const onNodeExplore = async (e : { nodes : string[] }) => {
                console.log("onNodeExplore", e.nodes);
                if (e.nodes.length == 0) {
                    return;
                }

                incrementLoadingCount();
                await explore({
                    nodeId : e.nodes[0],
                    up : true,
                    down : true,
                    nodes,
                    edges,
                    onInconsistencyDetected,
                    firstAddedNode,
                }).then(
                    () => {
                        decrementLoadingCount();
                    },
                    (err) => {
                        error.push("negative", [err.message]);
                        decrementLoadingCount();
                    }
                );
                nodes.flush();
                edges.flush();
                newNetwork.redraw();
            };

            newNetwork.on("click", onNodeSelected);
            newNetwork.on("dragStart", onNodeSelected);
            newNetwork.on("doubleClick", onNodeExplore);

            setNetwork(newNetwork);
            console.log("Network initialized");
        },
        [renderElement.current]
    );

    React.useEffect(
        () => {
            console.log("Loading from query");
            const query = parseQuery(searchRef.current);


            let loadIdArr : number[] = [...query.start];
            if (query.selectedNodeId != undefined) {
                //Pushing to the front loads this first,
                //causing it to be the center of the screen
                loadIdArr.unshift(query.selectedNodeId);
            }
            loadIdArr = [...new Set(loadIdArr)].filter((id) => {
                return isFinite(id) && nodes.get(id.toString()) == undefined;
            });
            const load = async () => {
                for (const nodeId of loadIdArr) {
                    await api.node.fetchSimple()
                        .setParam({
                            nodeId : bigIntLib.BigInt(nodeId),
                        })
                        .on(404, () => undefined)
                        .send()
                        .then((result) => {
                            if (result.responseBody == undefined) {
                                return;
                            }
                            addNode({
                                node : {
                                    nodeId : result.responseBody.nodeId.toString(),
                                    title : result.responseBody.latestEdit.title,
                                    description : result.responseBody.latestEdit.description,
                                    depth : result.responseBody.depth,
                                    tags : result.responseBody.tags,
                                },
                                nodes,
                                firstAddedNode,
                            });
                        })
                        .catch((err) => {
                            console.error(err);
                            error.push("negative", [err.message]);
                        });
                }
                for (const nodeId of loadIdArr) {
                    await explore({
                        nodeId : nodeId.toString(),
                        up : true,
                        down : true,
                        nodes,
                        edges,
                        onInconsistencyDetected,
                        firstAddedNode,
                    }).catch((err) => {
                        console.error(err);
                        error.push("negative", [err.message]);
                    });
                }

                let randomId : number|undefined;
                if (query.random == true) {
                    await api.node.fetchRandomSimple()
                        .send()
                        .then((result) => {
                            randomId = Number(result.responseBody.nodeId);
                            addNode({
                                node : {
                                    nodeId : result.responseBody.nodeId.toString(),
                                    title : result.responseBody.latestEdit.title,
                                    description : result.responseBody.latestEdit.description,
                                    depth : result.responseBody.depth,
                                    tags : result.responseBody.tags,
                                },
                                nodes,
                                firstAddedNode,
                            });
                            return explore({
                                nodeId : result.responseBody.nodeId.toString(),
                                up : true,
                                down : true,
                                nodes,
                                edges,
                                onInconsistencyDetected,
                                firstAddedNode,
                            });
                        })
                        .catch((err) => {
                            console.error(err);
                            error.push("negative", [err.message]);
                        });
                }
                nodes.flush();
                edges.flush();
                if (network != undefined) {
                    network.redraw();
                }

                if (query.selectedNodeId == undefined) {
                    if (query.random == true && randomId != undefined) {
                        const search = QueryUtil.mutateSearch(
                            searchRef.current,
                            {
                                update : {
                                    random : undefined,
                                    selectedNodeId : randomId.toString(),
                                }
                            }
                        );
                        props.history.replace(`${props.location.pathname}${search}`);
                    } /*else if (query.start.length > 0) {
                        query.selected = query.start[0];
                        this.setQuery(query, true);
                    }*/ else {
                        /*this.setState({
                            selectedNodeId : undefined,
                            viewingSelectedNodeId : false,
                        });*/
                    }
                } else {
                    /*this.setState({
                        selectedNodeId : query.selected,
                        viewingSelectedNodeId : (query.viewSelected == true),
                    });*/
                }
            };
            load()
                .catch((err) => {
                    console.error(err);
                    error.push("negative", [err.message]);
                });
        },
        [searchRef.current]
    );

    const query = QueryUtil.toObject(searchRef.current);
    const showExplorationUi = QueryUtil.getBoolean(query, "showExplorationUi", false);
    const selectedNodeId = QueryUtil.getBigInt(query, "selectedNodeId", undefined);
    const viewSelected = QueryUtil.getBoolean(query, "viewSelected", false);

    const [recursionCount, setRecursionCount] = React.useState(DEFAULT_RECURSION_COUNT.toString());

    function getRecursionCount () {
        let result = parseInt(recursionCount, 10);
        if (!isFinite(result)) {
            result = DEFAULT_RECURSION_COUNT;
        }
        if (result > MAX_RECURSION_COUNT) {
            result = MAX_RECURSION_COUNT;
        }
        setRecursionCount(result.toString());
        return result;
    }

    return (
        <div style={{
            height:"100%",
        }}>
            <div
                className="main"
                style={{
                    height:"100%",
                    backgroundColor:"#000000",
                }}
                ref={renderElement}
            >
            </div>
            <div
                className={"ui simple dropdown item button"}
                style={{
                    position : "fixed",
                    top : "70px",
                    left : "5px",
                    textAlign : "left",
                }}
            >
                Options
                <i className="dropdown icon"></i>
                <div className="menu">
                    {
                        selectedNodeId == undefined ?
                        undefined :
                        <div
                            className="ui item"
                            onClick={() => {
                                const search = QueryUtil.mutateSearch(
                                    props.location.search,
                                    {
                                        update : {
                                            viewSelected : "true",
                                        }
                                    }
                                );
                                props.history.replace(`${props.location.pathname}${search}`);
                            }}
                        >
                            View Selected
                        </div>
                    }
                    <div
                        className="ui item"
                        onClick={() => {
                            const search = QueryUtil.mutateSearch(
                                props.location.search,
                                {
                                    update : {
                                        showExplorationUi : (
                                            showExplorationUi ?
                                            undefined :
                                            "true"
                                        ),
                                    }
                                }
                            );
                            props.history.replace(`${props.location.pathname}${search}`);
                        }}
                    >
                        {
                            showExplorationUi ?
                            "Hide Exploration UI" :
                            "Show Exploration UI"
                        }
                    </div>
                </div>
            </div>
            {
                (showExplorationUi && selectedNodeId != undefined) ?
                <span style={{
                    position : "fixed",
                    top : "70px",
                    right : "5px",
                    textAlign : "right",
                    width : "100px",
                    display : "flex",
                    flexDirection : "column",
                }}>
                    <div className="ui input">
                        <input
                            style={{ textAlign : "right" }}
                            type="number"
                            value={recursionCount}
                            onChange={(e) => {
                                setRecursionCount(e.target.value);
                            }}
                        />
                    </div>
                    <button
                        className="ui button"
                        onClick={async () => {
                            incrementLoadingCount();
                            await exploreRecursive({
                                nodeId : selectedNodeId.toString(),
                                count : getRecursionCount(),
                                up : true,
                                down : false,
                                nodes,
                                edges,
                                onInconsistencyDetected,
                                firstAddedNode,
                            }).then(
                                () => {
                                    decrementLoadingCount();
                                },
                                (err) => {
                                    error.push("negative", [err.message]);
                                    decrementLoadingCount();
                                }
                            );
                            nodes.flush();
                            edges.flush();
                            if (network != undefined) {
                                network.redraw();
                            }
                        }}
                    >
                        Parent
                    </button>
                    <button
                        className="ui button"
                        onClick={async () => {
                            incrementLoadingCount();
                            await exploreRecursive({
                                nodeId : selectedNodeId.toString(),
                                count : getRecursionCount(),
                                up : false,
                                down : true,
                                nodes,
                                edges,
                                onInconsistencyDetected,
                                firstAddedNode,
                            }).then(
                                () => {
                                    decrementLoadingCount();
                                },
                                (err) => {
                                    error.push("negative", [err.message]);
                                    decrementLoadingCount();
                                }
                            );
                            nodes.flush();
                            edges.flush();
                            if (network != undefined) {
                                network.redraw();
                            }
                        }}
                    >
                        Child
                    </button>
                    <button
                        className="ui button"
                        onClick={async () => {
                            incrementLoadingCount();
                            await exploreRecursive({
                                nodeId : selectedNodeId.toString(),
                                count : getRecursionCount(),
                                up : true,
                                down : true,
                                nodes,
                                edges,
                                onInconsistencyDetected,
                                firstAddedNode,
                            }).then(
                                () => {
                                    decrementLoadingCount();
                                },
                                (err) => {
                                    error.push("negative", [err.message]);
                                    decrementLoadingCount();
                                }
                            );
                            nodes.flush();
                            edges.flush();
                            if (network != undefined) {
                                network.redraw();
                            }
                        }}
                    >
                        Recursive
                    </button>
                    {
                        network == undefined ?
                        undefined :
                        <button
                            className="ui button"
                            onClick={async () => {
                                network.focus(selectedNodeId.toString(), { animation : true });
                            }}
                        >
                            Focus
                        </button>
                    }
                </span> :
                undefined
            }
            <ErrorMessage
                error={error}
                style={{
                    position : "fixed",
                    bottom : "5px",
                    right : "5px",
                }}
                onCloseClick={() => {
                    error.reset();
                }}
            />
            <div
                className={classnames(
                    ["ui text loader inverted"],
                    loadingCount.current > 0 ? "active" : undefined,
                )}
                style={{
                    position : "fixed",
                    top : "inherit",
                    bottom : "-20px",
                    left : "50px",
                }}
            >
                Loading...
            </div>
            {
                viewSelected && selectedNodeId != undefined ?
                <DynamicDetailedItem
                    className="graph-dynamic-detailed-item"
                    nodeId={selectedNodeId.toString()}
                    open={viewSelected}
                    onClose={() => {
                        const search = QueryUtil.mutateSearch(
                            props.location.search,
                            {
                                update : {
                                    viewSelected : undefined,
                                }
                            }
                        );
                        props.history.replace(`${props.location.pathname}${search}`);
                    }}
                /> :
                undefined
            }
            {/*<ViewNodeButton
                onViewClick={this.onViewClick}
                onCloseClick={this.onCloseClick}
                nodeId={this.state.selectedNodeId}
                viewing={this.state.viewingSelectedNodeId}
                viewButtonStyle={{
                    position : "fixed",
                    top : "70px",
                    left : "5px",
                }}
                nodeViewClassName={"graph-page-node-view ui container"}
                nodeViewContainerClassName={"graph-page-node-view-container topmost"}
            />*/}
        </div>
    );
}
