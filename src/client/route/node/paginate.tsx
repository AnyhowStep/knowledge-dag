import * as React from "react";
import {RouteComponentProps, Link} from "react-router-dom";
import {
    PaginateBase,
    Counter,
    QueryUtil,
} from "../../ui";
import {api} from "../../api";
import {NodeSimple} from "../../../api-mapper";

function toSearchArray (str : string) {
    return str
        .split(/\s+/g)
        .filter(s => s.length >= 3);
}

function parseSearch (search : string) {
    let titleStr = "";
    let tagStr = "";
    let keywordStr = "";
    let tagExactStr = "";

    const searchArr = search.split(/((?:\w|\-)+:)/);
    for (let i=0; i<searchArr.length; ++i) {
        const cur = searchArr[i];
        if (cur == "title:") {
            ++i;
            titleStr += " " + searchArr[i];
        } else if (cur == "tag:") {
            ++i;
            tagStr += " " + searchArr[i];
        } else if (cur == "keyword:") {
            ++i;
            keywordStr += " " + searchArr[i];
        } else if (cur == "tag-exact:") {
            ++i;
            tagExactStr += " " + searchArr[i];
        } else {
            keywordStr += cur;
        }
    }

    return {
        title : toSearchArray(titleStr),
        tag : toSearchArray(tagStr),
        keyword : toSearchArray(keywordStr),
        tagExact : toSearchArray(tagExactStr),
    };
}

export function Paginate (props : RouteComponentProps<{}>) {
    return (
        <PaginateBase<NodeSimple>
            {...props}
            fetchPage={(page) => {
                const query = QueryUtil.toObject(props.location.search);
                const {
                    title,
                    tag,
                    keyword,
                    tagExact,
                } = parseSearch(QueryUtil.getString(query, "search", ""));
                return api.node
                    .paginate()
                    .setQuery({
                        page,
                        rowsPerPage : undefined,
                        title,
                        tag,
                        keyword,
                        tagExact,
                    })
                    .send()
                    .then(result => result.responseBody)
            }}
            renderItem={(node) => {
                return (
                    <Link
                        key={node.nodeId.toString()}
                        className="item"
                        to={`/node/${node.nodeId}`}
                    >
                        <div className="content">
                            <div className="header" style={{ display : "inline-block" }}>
                                {node.latestEdit.title}
                            </div>
                            <Counter label="Depth" count={node.depth.toString()}/>
                            {
                                node.latestEdit.description.length == 0 ?
                                undefined :
                                <div className="description">
                                    {node.latestEdit.description}
                                </div>
                            }
                        </div>
                    </Link>
                );
            }}
        />
    );
}
