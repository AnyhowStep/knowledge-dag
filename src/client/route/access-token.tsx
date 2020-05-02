import * as React from "react";
import {storage} from "../storage";
import {RouteComponentProps} from "react-router";

export const AccessToken = (props : RouteComponentProps) => {
    const [accessToken, setAccessToken] = React.useState("");
    return (
        <div className="ui main container">
            <form className="ui form" onSubmit={() => {
                storage.setAccessToken(accessToken);
                props.history.push(`/`);
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
            </form>
        </div>
    );
};
