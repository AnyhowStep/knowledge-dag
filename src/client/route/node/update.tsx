import * as React from "react";
import * as classnames from "classnames";
import {bigIntLib} from "bigint-lib";
import {NodeTagMultiselect, useError} from "../../ui";
import {api} from "../../api";
import {storage} from "../../storage";
import {RouteComponentProps} from "react-router";
import {ErrorMessage} from "../../ui/error-message";
import {isMappingError} from "type-mapping/dist/error-util";
import {NodeDetailed} from "../../../api-mapper";

export interface UpdateProps extends RouteComponentProps<{ nodeId : string }> {

}

export const Update = (props : UpdateProps) => {
    const error = useError();

    const [node, setNode] = React.useState<NodeDetailed|undefined>(undefined);
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [content, setContent] = React.useState("");
    const [tags, setTags] = React.useState<readonly string[]>([]);

    const [submitDisabled, setSubmitDisabled] = React.useState(true);

    React.useEffect(
        () => {
            setNode(undefined);
            setTitle("");
            setDescription("");
            setContent("");
            setTags([]);
            setSubmitDisabled(true);

            let cancelled = false;
            api.node.fetchDetailed()
                .setParam({
                    nodeId : bigIntLib.BigInt(props.match.params.nodeId),
                })
                .send()
                .then((response) => {
                    if (cancelled) {
                        return;
                    }
                    setTitle(response.responseBody.latestEdit.title);
                    setDescription(response.responseBody.latestEdit.description);
                    setContent(response.responseBody.latestEdit.content);
                    setTags(response.responseBody.tags);
                    setSubmitDisabled(false);
                    /**
                     * We call `setNode()` last to avoid bugs with `selectize.MultiSelect`
                     */
                    setNode(response.responseBody);
                    error.reset();
                })
                .catch((err) => {
                    if (cancelled) {
                        return;
                    }
                    error.push("negative", err.message);
                })
            return () => {
                cancelled = true;
            }
        },
        [props.match.params.nodeId]
    );

    return (
        <div className="ui fullscreen container">
            <div className={classnames({
                "ui loader" : true,
                "active" : node == undefined,
            })}></div>
            {
                node == undefined ?
                <ErrorMessage error={error}/> :
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

                        api.node.update()
                            .setHeader({
                                "access-token": accessToken,
                            })
                            .setParam({
                                nodeId : bigIntLib.BigInt(props.match.params.nodeId),
                            })
                            .setBody({
                                title,
                                description,
                                content,
                                tags,
                            })
                            .send()
                            .then(() => {
                                props.history.push(`/node/${props.match.params.nodeId}`);
                            })
                            .catch((err) => {
                                console.error(err);
                                if (isMappingError(err)) {
                                    if (err.propertyErrors == undefined) {
                                        error.push("negative", [err.message]);
                                    } else {
                                        error.push("negative", err.propertyErrors.map(e => e.message));
                                    }
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
                                type="text"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                }}
                            />
                        </div>
                        <div className="field">
                            <label>Description</label>
                            <input
                                type="text"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                }}
                            />
                        </div>
                    </div>
                    <div className="field">
                        <label>Tags</label>
                        <NodeTagMultiselect
                            values={tags}
                            setValues={setTags}
                        />
                    </div>
                    <textarea
                        placeholder="Content"
                        style={{
                            fontFamily : `"Courier New", Courier, monospace`,
                            maxHeight : "unset",
                            flex : 1,
                        }}
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                        }}
                    ></textarea>
                    <button
                        className={"ui button large primary"}
                        type="submit"
                        disabled={submitDisabled}
                    >
                        Submit
                    </button>
                    <ErrorMessage error={error}/>
                </form>
            }
        </div>
    );
};
