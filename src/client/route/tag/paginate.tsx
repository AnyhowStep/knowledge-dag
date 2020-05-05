import * as React from "react";
import {RouteComponentProps, Link} from "react-router-dom";
import {
    PaginateBase,
    Counter,
} from "../../ui";
import {api} from "../../api";
import {TagWithCount} from "../../../api-mapper";
import {storage} from "../../storage";

export function Paginate (props : RouteComponentProps<{}>) {
    const accessToken = storage.getAccessToken();
    return (
        <PaginateBase<TagWithCount>
            {...props}
            fetchPage={(page) => {
                return api.tag
                    .paginateWithCount()
                    .setQuery({
                        page,
                        rowsPerPage : undefined,
                    })
                    .send()
                    .then(result => result.responseBody)
            }}
            renderItem={(tag) => {
                return (
                    <Link
                        key={tag.title}
                        className="item"
                        to={`/node?search=${encodeURIComponent(`tag-exact:${tag.title}`)}`}
                    >
                        <div className="content">
                            <div className="header" style={{ display : "inline-block" }}>
                                {tag.title}
                            </div>
                            {
                                (accessToken == undefined) ?
                                undefined :
                                <React.Fragment>
                                    <Link
                                        className="ui right floated button icon mini basic negative"
                                        to={`/tag/${tag.tagId}/delete`}
                                    >
                                        <i className="remove icon"></i>
                                    </Link>
                                    <Link
                                        className="ui right floated button icon mini basic"
                                        to={`/tag/${tag.tagId}/update`}
                                    >
                                        <i className="edit icon"></i>
                                    </Link>
                                </React.Fragment>
                            }
                            <Counter label="Nodes" count={tag.nodeCount.toString()}/>
                        </div>
                    </Link>
                );
            }}
        />
    );
}
