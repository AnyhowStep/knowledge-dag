import * as React from "react";

export interface HomePageProps {
}

export const HomePage = (_props : HomePageProps) => {
    return (
        <React.Fragment>
            <div className="ui main container">
                <h1 className="ui dividing header">Knowledge DAG</h1>

                TODO

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
    )
};
