import * as React from "react";
import * as selectize from "react-selectize";
import "react-selectize/dist/index.css";
import {useError} from "./hook";
import {ErrorMessage} from "./error-message";
import {api} from "../api";
import {bigIntLib} from "bigint-lib";
import * as route from "../route";

export interface NodeSelectProps {
    readonly autofocus? : boolean,
    readonly readOnly? : boolean,

    readonly value : bigint|undefined,
    readonly setValue : (newValue : bigint|undefined) => void,
}

interface MyOptionValue {
    label : string,
    value : {
        nodeId : string,
        tags : string[],
    }
}

export function NodeSelect (props : NodeSelectProps) {
    const error = useError();

    const [node, setNode] = React.useState<MyOptionValue|undefined>(undefined);
    const [search, setSearch] = React.useState("");
    const [options, setOptions] = React.useState<MyOptionValue[]>([]);
    const [paginateTimer, setPaginateTimer] = React.useState<number|undefined>(undefined);

    React.useEffect(
        () => {
            if (props.value == undefined) {
                if (node != undefined) {
                    setNode(undefined);
                }
                return undefined;
            } else {
                if (node == undefined || node.value.nodeId != props.value.toString()) {
                    setNode({
                        label : `Node #${props.value}`,
                        value : {
                            nodeId : props.value.toString(),
                            tags : [],
                        },
                    });

                    let cancelled = false;
                    api.node.fetchSimple()
                        .setParam({
                            nodeId : props.value,
                        })
                        .send()
                        .then((response) => {
                            if (cancelled) {
                                return;
                            }
                            setNode({
                                label : response.responseBody.latestEdit.title,
                                value : {
                                    nodeId : response.responseBody.nodeId.toString(),
                                    tags : response.responseBody.tags,
                                },
                            });
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
                } else {
                    return undefined;
                }
            }
        },
        [props.value]
    );

    return (
        <div>
            <selectize.SimpleSelect
                autofocus={props.autofocus}
                filterOptions={items => items}
                disabled={props.readOnly}
                options={options}
                search={search}
                style={{
                    width : "100%",
                }}
                theme={"bootstrap3"}
                value={node}
                restoreOnBackspace={(item) => {
                    return item.label;
                }}
                onValueChange={(option : undefined|MyOptionValue) => {
                    console.log("onValueChange", option);
                    if (option == undefined) {
                        props.setValue(undefined);
                    } else {
                        props.setValue(bigIntLib.BigInt(option.value.nodeId));
                    }
                }}
                renderNoResultsFound={(_value : MyOptionValue, search) => {
                    const keyword = search
                        .split(/\s+/g)
                        .filter(s => s.length >= 3);
                    if (keyword.length == 0) {
                        return <div className="ui yellow label">Try keying in more characters to start a search</div>;
                    } else {
                        return <div></div>;
                    }
                }}
                renderOption={(item : MyOptionValue) => {
                    return (
                        <div className="simple-option">
                            {item.label}
                            &nbsp;
                            {
                                item.value.tags.length == 0 ?
                                undefined :
                                route.node.tagList(item.value.tags)
                            }
                        </div>
                    );
                }}
                onSearchChange={(search) => {
                    setSearch(search);

                    const timer = setTimeout(
                        () => {
                            const keyword = search
                                .split(/\s+/g)
                                .filter(s => s.length >= 3);
                            if (keyword.length == 0) {
                                return;
                            }

                            api.node.paginate()
                                .setQuery({
                                    keyword,
                                    page : undefined,
                                    rowsPerPage : undefined,
                                })
                                .send()
                                .then((result) => {
                                    setOptions(result.responseBody.rows.map((node) => {
                                        return {
                                            label : node.latestEdit.title,
                                            value : {
                                                nodeId : node.nodeId.toString(),
                                                tags : node.tags,
                                            },
                                        };
                                    }));
                                })
                                .catch((err) => {
                                    if (err.response == undefined) {
                                        error.push("negative", ["An unexpected error occurred"]);
                                    } else {
                                        error.push("negative", err.response.data.error);
                                    }
                                });
                        },
                        1000
                    );
                    if (paginateTimer != undefined) {
                        clearTimeout(paginateTimer);
                    }
                    setPaginateTimer(timer);
                }}
            />
            <ErrorMessage error={error}/>
        </div>
    );
}
