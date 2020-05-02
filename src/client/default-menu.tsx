import * as React from "react";
import {Route, RouteComponentProps} from "react-router-dom";
import {DropdownHook} from "./ui";

export interface DefaultMenuProps {
    sidebarHook : DropdownHook,
}
export function DefaultMenu (props : DefaultMenuProps) {
    const [searchInput, setSearchInput] = React.useState("");

    return <Route render={({history} : RouteComponentProps<any>) => {
        const goToSearch = () => {
            if (/^\s*$/.test(searchInput)) {
                return;
            }
            history.push(`/node?keyword=${encodeURIComponent(searchInput)}`);
        };

        return (
            <div className="ui fixed inverted menu">
                <a
                    className="ui item header home-button"
                    onClick={props.sidebarHook.onClick}
                    onMouseOver={props.sidebarHook.onMouseOver}
                    ref={props.sidebarHook.ref}
                >
                    <span className="home-button-text">
                        <i className="bars icon"></i>
                    </span>
                    <span className="mini-home-button-text">
                        <i className="bars icon"></i>
                    </span>
                </a>
                <div className="ui item" style={{
                    minWidth : "0px",
                    //maxWidth : "200px",
                    flex : 1,
                }}>
                    <form className="ui input" onSubmit={(e) => {
                        e.preventDefault();
                        goToSearch();
                    }}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchInput}
                            onChange={(e) => {
                                setSearchInput(e.target.value);
                            }}
                        />
                    </form>
                </div>
            </div>
        );
    }}/>
}
