import * as React from "react";
import {bigIntLib} from "bigint-lib";
import {useError, NodeSelect} from "../../ui";
import {api} from "../../api";
import {storage} from "../../storage";
import {RouteComponentProps} from "react-router";
import {ErrorMessage} from "../../ui/error-message";
import {isMappingError} from "type-mapping/dist/error-util";
import {NodeSimple} from "../../../api-mapper";

export interface CreateProps extends RouteComponentProps<{ nodeId : string }> {

}

export const Create = (props : CreateProps) => {
    const error = useError();

    const [node, setNode] = React.useState<NodeSimple|undefined>(undefined);

    React.useEffect(
        () => {
            setNode(undefined);
            let cancelled = false;
            api.node.fetchSimple()
                .setParam({
                    nodeId : bigIntLib.BigInt(props.match.params.nodeId),
                })
                .send()
                .then((response) => {
                    if (cancelled) {
                        return;
                    }
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

    const [parentId, setParentId] = React.useState<bigint|undefined>(undefined);

    const [submitDisabled, setSubmitDisabled] = React.useState(false);

    return (
        <div className="ui main container">
            <h1 className="ui dividing header">Create Dependency</h1>
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
                    if (parentId == undefined) {
                        error.push("negative", [
                            "Please select a parent first"
                        ]);
                        return;
                    }
                    setSubmitDisabled(true);

                    api.dependency.create()
                        .setHeader({
                            "access-token" : accessToken,
                        })
                        .setParam({
                            nodeId : bigIntLib.BigInt(props.match.params.nodeId),
                            parentId : bigIntLib.BigInt(parentId),
                        })
                        .on(304, () => undefined)
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
                            value={node == undefined ? "Loading..." : node.latestEdit.title}
                        />
                    </div>
                    <div className="field">
                        <label>Description</label>
                        <input
                            disabled
                            type="text"
                            placeholder="Description"
                            value={node == undefined ? "Loading..." : node.latestEdit.description}
                        />
                    </div>
                </div>
                <div className="field">
                    <label>Parent</label>
                    <NodeSelect
                        autofocus
                        value={parentId}
                        setValue={setParentId}
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
        </div>
    );
};
