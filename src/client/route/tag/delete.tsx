import * as React from "react";
import {bigIntLib} from "bigint-lib";
import {useError} from "../../ui";
import {api} from "../../api";
import {storage} from "../../storage";
import {RouteComponentProps} from "react-router";
import {ErrorMessage} from "../../ui/error-message";
import {isMappingError} from "type-mapping/dist/error-util";
import {TagWithCount} from "../../../api-mapper";

export interface DeleteProps extends RouteComponentProps<{ tagId : string }> {

}

export const Delete = (props : DeleteProps) => {
    const error = useError();

    const [tag, setTag] = React.useState<TagWithCount|undefined>(undefined);

    React.useEffect(
        () => {
            setTag(undefined);
            let cancelled = false;
            api.tag.fetchWithCount()
                .setParam({
                    tagId : bigIntLib.BigInt(props.match.params.tagId),
                })
                .send()
                .then((response) => {
                    if (cancelled) {
                        return;
                    }
                    setTag(response.responseBody)
                    error.reset();
                })
                .catch((err) => {
                    if (cancelled) {
                        return;
                    }

                    if (err.sendResult != undefined) {
                        error.push("negative", err.sendResult.responseBody.errors.map((e : any) => e.detail));
                    } else {
                        error.push("negative", [err.message]);
                    }
                })
            return () => {
                cancelled = true;
            }
        },
        [props.match.params.tagId]
    );

    const [submitDisabled, setSubmitDisabled] = React.useState(false);

    return (
        <div className="ui main container">
            <h1 className="ui dividing header">Delete Tag</h1>
            <form
                className="ui form"
                style={{
                    height : "100%",
                    display : "flex",
                    flexDirection : "column",
                }}
                onSubmit={(e) => {
                    e.preventDefault();
                    if (submitDisabled) {
                        return;
                    }

                    const accessToken = storage.getAccessToken();
                    if (accessToken == undefined) {
                        error.push("negative", [{
                            message : "Please set your access token first",
                            link : "/access-token",
                        }]);
                        return;
                    }
                    setSubmitDisabled(true);

                    api.tag.delete()
                        .setHeader({
                            "access-token" : accessToken,
                        })
                        .setParam({
                            tagId : bigIntLib.BigInt(props.match.params.tagId),
                        })
                        .on(304, () => undefined)
                        .send()
                        .then(() => {
                            props.history.push(`/tag`);
                        })
                        .catch((err) => {
                            console.error(err);
                            if (isMappingError(err)) {
                                if (err.propertyErrors == undefined) {
                                    error.push("negative", [err.message]);
                                } else {
                                    error.push("negative", err.propertyErrors.map(e => e.message));
                                }
                            } else if (err.sendResult != undefined) {
                                error.push("negative", err.sendResult.responseBody.errors.map((e : any) => e.detail));
                            } else {
                                error.push("negative", [err.message]);
                            }
                            setSubmitDisabled(false);
                        });
                }}
            >
                <div className="fields equal width">
                    <div className="field">
                        <label>Title</label>
                        <input
                            disabled
                            type="text"
                            placeholder="Title"
                            value={tag == undefined ? "Loading..." : tag.title}
                        />
                    </div>
                    <div className="field">
                        <label>Node Count</label>
                        <input
                            disabled
                            type="text"
                            placeholder="Node Count"
                            value={tag == undefined ? "Loading..." : tag.nodeCount.toString()}
                        />
                    </div>
                </div>
                <button
                    className={"ui button large primary"}
                    type="submit"
                    disabled={submitDisabled}
                >
                    Submit
                </button>
                <ErrorMessage error={error}/>
            </form>
        </div>
    );
};
