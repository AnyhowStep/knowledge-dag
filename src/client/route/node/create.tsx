import * as React from "react";
import {NodeTagMultiselect, useError} from "../../ui";
import {api} from "../../api";
import {storage} from "../../storage";
import {RouteComponentProps} from "react-router";
import {ErrorMessage} from "../../ui/error-message";
import {isMappingError} from "type-mapping/dist/error-util";

export interface CreateProps extends RouteComponentProps {

}

export const Create = (props : CreateProps) => {
    const error = useError();

    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [content, setContent] = React.useState("");
    const [tags, setTags] = React.useState<readonly string[]>([]);

    const [submitDisabled, setSubmitDisabled] = React.useState(false);

    return (
        <div className="ui fullscreen container">
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

                    api.node.create()
                        .setHeader({
                            "access-token": accessToken,
                        })
                        .setBody({
                            title,
                            description,
                            content,
                            tags,
                        })
                        .send()
                        .then((response) => {
                            props.history.push(`/node/${response.responseBody.nodeId}`);
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
        </div>
    );
};
