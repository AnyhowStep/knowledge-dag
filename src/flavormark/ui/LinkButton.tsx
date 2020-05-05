import * as React from "react";
import {Link} from "react-router-dom";
import {Component} from "react";

export interface LinkButtonProps {
    to : string,
    className? : string,
}
export interface LinkButtonState {
}
export class LinkButton extends Component<LinkButtonProps, LinkButtonState> {
    public constructor (props : LinkButtonProps) {
        super(props);
        this.state = {};
    }
    public render () {
        const className = ["ui button"];
        if (this.props.className != undefined) {
            className.push(this.props.className);
        }
        return (
            <Link className={className.join(" ")} to={this.props.to}>{this.props.children}</Link>
        );
    }
}
