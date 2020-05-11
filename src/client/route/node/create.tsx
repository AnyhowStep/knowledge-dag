import * as React from "react";
import {useError} from "../../ui";
import {api} from "../../api";
import {storage} from "../../storage";
import {RouteComponentProps} from "react-router";
import {ErrorMessage} from "../../ui/error-message";
import {isMappingError} from "type-mapping/dist/error-util";
import {useForm, Form} from "./form";

export interface CreateProps extends RouteComponentProps {

}

export const Create = (props : CreateProps) => {
    const error = useError();

    const form = useForm();

    const {
        title,
        description,
        content,
        tags,
        submitDisabled,
        setSubmitDisabled,
    } = form;

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
                <Form {...form}/>
                <ErrorMessage error={error}/>
            </form>
        </div>
    );
};
