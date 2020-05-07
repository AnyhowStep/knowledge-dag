import * as React from "react";
import {storage} from "../storage";
import {RouteComponentProps} from "react-router";
import {api} from "../api";
import {useError, ErrorMessage} from "../ui";

export const AccessToken = (props : RouteComponentProps) => {
    const error = useError();
    const [accessToken, setAccessToken] = React.useState("");
    return (
        <div className="ui main container">
            <form className="ui form" onSubmit={(evt) => {
                evt.preventDefault();

                api.auth.authenticate()
                    .setHeader({
                        "access-token": accessToken,
                    })
                    .send()
                    .then(
                        () => {
                            storage.setAccessToken(accessToken);
                            props.history.push(`/`);
                        },
                        (err) => {
                            console.error(err);
                            error.push("negative", [err.message]);
                        }
                    );
            }}>
                <input
                    type="password"
                    placeholder="Access Token"
                    value={accessToken}
                    onChange={(e) => {
                        setAccessToken(e.target.value);
                    }}
                />
                <button type="submit" className="ui button">
                    Save
                </button>
                <ErrorMessage error={error}/>
            </form>
        </div>
    );
};
