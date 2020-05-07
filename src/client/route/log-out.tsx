import * as React from "react";
import {storage} from "../storage";
import {RouteComponentProps} from "react-router";

export const LogOut = (props : RouteComponentProps) => {
    return (
        <div className="ui main container">
            <button
                type="submit"
                className="ui button"
                onClick={() => {
                    storage.unsetAccessToken();
                    props.history.push(`/`);
                }}
            >
                Log Out
            </button>
        </div>
    );
};
