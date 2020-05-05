import * as React from "react";
import * as selectize from "react-selectize";
import "react-selectize/dist/index.css";
import {useError} from "./hook";
import {ErrorMessage} from "./error-message";
import {NodeTagUtil} from "./util/node-tag-util";
import {api} from "../api";

export interface NodeTagMultiselectProps {
    readonly readOnly? : boolean,
    readonly values : readonly string[],
    readonly setValues : (newValues : readonly string[]) => void,
}

export function NodeTagMultiselect (props : NodeTagMultiselectProps) {
    const error = useError();

    const [search, setSearch] = React.useState("");
    const [options, setOptions] = React.useState<selectize.OptionValue[]>([]);
    const [paginateTimer, setPaginateTimer] = React.useState<number|undefined>(undefined);

    return (
        <div>
            <selectize.MultiSelect
                disabled={props.readOnly}
                options={options}
                search={search}
                style={{
                    width : "100%",
                }}
                theme={"bootstrap3"}
                defaultValues={props.values.map((s) => {
                    return {
                        label : s,
                        value : s,
                    };
                })}
                delimiters={[188]}
                restoreOnBackspace={(item) => {
                    return item.label;
                }}
                onValuesChange={(values : any) => {
                    console.log("onValuesChange", values, values.map((item : selectize.OptionValue) => {
                        return item.label;
                    }));
                    props.setValues(values.map((item : selectize.OptionValue) => {
                        return item.label;
                    }));
                }}
                createFromSearch={((_options: selectize.OptionValue[], values: selectize.OptionValue[], search: string) => {
                    search = NodeTagUtil.ToTitle(search);
                    if (search.length < 3) {
                        return null;
                    } else if (values.map((v : selectize.OptionValue)=>v.label).indexOf(search) >= 0) {
                        return null;
                    } else {
                        return {
                            label : search,
                            value : search,
                        };
                    }
                }) as any}
                renderNoResultsFound={(values : any, search) => {
                    search = NodeTagUtil.ToTitle(search);
                    if (search.length < 3) {
                        return <div className="ui yellow label">A tag must have at least 3 characters</div>;
                    } else if (values.map((v : selectize.OptionValue)=>v.label).indexOf(search) >= 0) {
                        return <div className="ui yellow label">Tag exists</div>;
                    } else {
                        return <div></div>
                    }
                }}
                onSearchChange={(search) => {
                    setSearch(search);
                    const timer = setTimeout(
                        () => {
                            const title = search
                                .split(/\s+/g)
                                .map(NodeTagUtil.ToTitle)
                                .filter(s => s.length >= 3);

                            api.tag.paginate()
                                .setQuery({
                                    title,
                                    page : undefined,
                                    rowsPerPage : undefined,
                                })
                                .send()
                                .then((result) => {
                                    setOptions(result.responseBody.rows.map((str) => {
                                        return {
                                            label : str,
                                            value : str,
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
