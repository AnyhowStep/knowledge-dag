import * as React from "react";
import * as classnames from "classnames";
import {bigIntLib} from "bigint-lib";
import {useError} from "../../ui";
import {api} from "../../api";
import {storage} from "../../storage";
import {RouteComponentProps} from "react-router";
import {ErrorMessage} from "../../ui/error-message";
import {isMappingError} from "type-mapping/dist/error-util";
import {NodeDetailed} from "../../../api-mapper";
import {useForm, Form} from "./form";

export interface UpdateProps extends RouteComponentProps<{ nodeId : string }> {

}

export const Update = (props : UpdateProps) => {
    const error = useError();

    const form = useForm();

    const {
        title,
        setTitle,
        description,
        setDescription,
        content,
        setContent,
        tags,
        setTags,
        submitDisabled,
        setSubmitDisabled,
    } = form;

    const [node, setNode] = React.useState<NodeDetailed|undefined>(undefined);

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
                });
            return () => {
                cancelled = true;
            };
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
                    <Form {...form}/>
                    <ErrorMessage error={error}/>
                </form>
            }
        </div>
    );
};
