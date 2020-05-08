import * as React from "react";
import {parseAndRenderReact} from "../../../dist/flavormark";

declare const require : {
    (path : string) : { default : string },
    context : (path : string, bool : boolean, regExp : RegExp) => {
        keys : () => {
            forEach : (
                callback : (key : string) => void
            ) => void
        },
        (path : string) : { default : string }
    }
};

const searchHelpText = require("!raw-loader!./search-help.md").default;

export interface HomePageProps {
}

export const HomePage = (_props : HomePageProps) => {
    return (
        <React.Fragment>
            <div className="ui main container">
                <h1 className="ui dividing header">Knowledge DAG</h1>

                TODO

                {parseAndRenderReact(searchHelpText)}

                <div style={{
                    paddingTop : "30px",
                }}>
                </div>
            </div>
            <div className="ui vertical footer segment">
                <div className="ui center aligned container">
                    <div className="ui stackable grid">
                        <div className="sixteen wide column">
                            <h4 className="ui header">Made with <i className="heart icon"></i></h4>
                            <p>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
};
