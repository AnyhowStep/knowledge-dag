import * as React from "react";
import * as classnames from "classnames";
import {bigIntLib} from "bigint-lib";
import {useError} from "../../ui";
import {api} from "../../api";
import {storage} from "../../storage";
import {RouteComponentProps} from "react-router";
import {ErrorMessage} from "../../ui/error-message";
import {isMappingError} from "type-mapping/dist/error-util";
import {TagWithCount} from "../../../api-mapper";

export interface UpdateProps extends RouteComponentProps<{ tagId : string }> {

}

export const Update = (props : UpdateProps) => {
    const error = useError();

    const [tag, setTag] = React.useState<TagWithCount|undefined>(undefined);
    const [title, setTitle] = React.useState("");

    const [submitDisabled, setSubmitDisabled] = React.useState(true);

    React.useEffect(
        () => {
            setTag(undefined);
            setTitle("");
            setSubmitDisabled(true);

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
                    setTitle(response.responseBody.title);
                    setSubmitDisabled(false);
                    setTag(response.responseBody);
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
        [props.match.params.tagId]
    );

    return (
        <div className="ui main container">
            <div className={classnames({
                "ui loader" : true,
                "active" : tag == undefined,
            })}></div>
            {
                tag == undefined ?
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

                        api.tag.update()
                            .setHeader({
                                "access-token": accessToken,
                            })
                            .setParam({
                                tagId : bigIntLib.BigInt(props.match.params.tagId),
                            })
                            .setBody({
                                title,
                            })
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
                                } else {
                                    error.push("negative", [err.message]);
                                }
                                setSubmitDisabled(false);
                            });
                    }}
                >
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
