import * as React from "react";
import {RouteComponentProps} from "react-router-dom";
import * as classnames from "classnames";
import * as m from "../../mapper";
import {Query, QueryUtil} from "./util";
import {ErrorMessage} from "./error-message";
import {PageSelect} from "./page-select";
import {useError} from "./hook";

interface Props<T> extends RouteComponentProps<{}> {
    fetchPage : (page : bigint, query : Query) => Promise<m.Paginated<T>>,
    renderItem : (item : T) => JSX.Element,
    children? : React.ReactNode,
    refreshCount? : number,

    onCache? : (item : m.Paginated<T>) => void,
    onNetwork? : (item : m.Paginated<T>) => void,
    onNetworkFail? : () => void,
    listClassName? : string,
}

/*
    Cache-Network | Success-Success | Show Network
    Cache-Network | Success-Failure | Show Cache & Show 1 Warning
    Cache-Network | Failure-Success | Show Network
    Cache-Network | Failure-Failure | Show 2 Errors
    Network-Cache | Success-Success | Show Network
    Network-Cache | Success-Failure | Show Network
    Network-Cache | Failure-Success | Show Network
    Network-Cache | Failure-Failure | Show Network
*/
export function PaginateBase<T> (props : Props<T>) {
    const query = QueryUtil.toObject(props.location.search);
    const page = QueryUtil.getBigInt(query, "page", BigInt(0));
    const error = useError();

    const [paginated, setPaginated] = React.useState<m.Paginated<T>|undefined>(undefined);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(
        () => {
            setLoading(true);
            let cancelled = false;
            props.fetchPage(page, query)
                .then((fetched) => {
                    if (cancelled) {
                        return;
                    }
                    setPaginated(fetched);
                    error.reset();
                    setLoading(false);
                })
                .catch((err) => {
                    if (cancelled) {
                        return;
                    }
                    error.push("negative", [err.message]);
                    setLoading(false);
                });
            return () => {
                cancelled = true;
                setLoading(false);
            };
        },
        [JSON.stringify(props.match.params), props.location.search, props.refreshCount]
    );

    if (paginated == undefined) {
        return (
            <div className="main ui container">
                <div className="ui segment">
                    <div className="ui active loader"></div>
                </div>
                <ErrorMessage error={error}/>
            </div>
        );
    }
    const setPage = (page : number) => {
        error.reset();
        props.history.push(
            props.location.pathname +
            "?" +
            QueryUtil.toString({
                ...query,
                page : page.toString(),
            })
        );
    };
    return (
        <div className="main ui container">
            <ErrorMessage error={error}/>
            <div
                className={classnames({
                    "ui loader" : true,
                    "active" : loading,
                })}
                style={{ position : "fixed" }}
            ></div>
            {props.children}
            <PageSelect
                page={page}
                pagesFound={paginated.info.pagesFound}
                setPage={setPage}
                rowsFound={paginated.info.rowsFound}
            />
            <div className={
                (props.listClassName == undefined) ?
                "ui big relaxed divided selection list segment" :
                props.listClassName
            }>
                {paginated.rows.map(props.renderItem)}
            </div>
            <PageSelect
                page={page}
                pagesFound={paginated.info.pagesFound}
                setPage={setPage}
                rowsFound={paginated.info.rowsFound}
            />
        </div>
    );
}
